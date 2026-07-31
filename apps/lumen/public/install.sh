#!/bin/sh
# Lumen toolchain installer.
#
#   curl -fsSL https://lumenfx.dev/install.sh | sh
#   curl -fsSL https://lumenfx.dev/install.sh | sh -s -- --components "add:candela" --no-confirm
#
# Reads the release manifest, downloads the archives for this platform from the
# download host, verifies each one against the sha256 in the manifest, and
# unpacks it under ~/.lumen. Nothing is written outside the prefix except an
# optional PATH line in a shell rc file, which is only added with consent.
#
# Manifest shape (schema_version 1):
#
#   {
#     "schema_version": 1,
#     "channel": "alpha",
#     "version": "0.1.0",
#     "base_url": "https://dl.lumenfx.dev",
#     "components": {
#       "lumen": {
#         "description": "...",
#         "default": true,
#         "targets": {
#           "linux-x86_64": {
#             "version": "0.1.0",
#             "url": "https://dl.lumenfx.dev/lumen/0.1.0/lumen-0.1.0-linux-x86_64.tar.gz",
#             "sha256": "...",
#             "size": 4194304,
#             "format": "tar.gz"
#           }
#         }
#       }
#     }
#   }
#
# Archives hold the tree to install: bin/ for executables, lib/ for libraries.
# Every installed path is recorded in a receipt under <prefix>/share/lumen, so a
# later run can replace an old version exactly and --uninstall can undo it.

set -eu

MANIFEST_URL="${MANIFEST_URL:-https://lumenfx.dev/install/manifest.json}"
BASE_URL_OVERRIDE="${LUMEN_BASE_URL:-}"
PREFIX="${LUMEN_PREFIX:-$HOME/.lumen}"
SUPPORTED_SCHEMA=1

PIN_VERSION=""
SPEC=""
NO_CONFIRM=0
MODIFY_PATH=1
FORCE=0
UNINSTALL=0

say() { printf '%s\n' "$*"; }
fail() { printf 'install.sh: %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Lumen toolchain installer.

Usage:
  install.sh [options]

Options:
  --prefix DIR         Install root. Default: ~/.lumen
  --version VERSION    Install a pinned release instead of the current one.
  --components SPEC    Adjust the component set. Semicolon-separated add: and
                       remove: entries applied to the default set, for example
                       "add:candela" or "add:candela;remove:lumen".
  --no-confirm         Run without prompting. Takes the resolved component set
                       and updates the shell rc file unless --no-modify-path.
  --no-modify-path     Never write a PATH line to a shell rc file.
  --force              Reinstall components that are already at the target
                       version.
  --uninstall          Remove every file this installer put under the prefix.
  -h, --help           Show this help.

Components:
  lumen      lumenc and liblumen. Installed by default.
  candela    The standalone candela toolchain: candela and candela-vm.

Environment:
  MANIFEST_URL     Manifest to read.
                   Default: https://lumenfx.dev/install/manifest.json
  LUMEN_BASE_URL   Replace the manifest download base URL. Used for testing
                   against a local mirror.
  LUMEN_PREFIX     Same as --prefix.
EOF
}

# --- arguments ---------------------------------------------------------------

while [ "$#" -gt 0 ]; do
  case "$1" in
    --prefix)
      [ "$#" -ge 2 ] || fail "--prefix needs a directory"
      PREFIX="$2"
      shift 2
      ;;
    --prefix=*) PREFIX="${1#--prefix=}"; shift ;;
    --version)
      [ "$#" -ge 2 ] || fail "--version needs a version"
      PIN_VERSION="$2"
      shift 2
      ;;
    --version=*) PIN_VERSION="${1#--version=}"; shift ;;
    --components)
      [ "$#" -ge 2 ] || fail "--components needs a spec"
      SPEC="$2"
      shift 2
      ;;
    --components=*) SPEC="${1#--components=}"; shift ;;
    --no-confirm) NO_CONFIRM=1; shift ;;
    --no-modify-path) MODIFY_PATH=0; shift ;;
    --force) FORCE=1; shift ;;
    --uninstall) UNINSTALL=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) fail "unknown option: $1 (try --help)" ;;
  esac
done

case "$PREFIX" in
  /*) ;;
  ~*) PREFIX="$HOME${PREFIX#\~}" ;;
  *) PREFIX="$PWD/$PREFIX" ;;
esac

BIN_DIR="$PREFIX/bin"
RECEIPT_DIR="$PREFIX/share/lumen"

# --- tools -------------------------------------------------------------------

if command -v curl >/dev/null 2>&1; then
  DOWNLOADER=curl
elif command -v wget >/dev/null 2>&1; then
  DOWNLOADER=wget
else
  DOWNLOADER=none
fi

if command -v sha256sum >/dev/null 2>&1; then
  HASHER=sha256sum
elif command -v shasum >/dev/null 2>&1; then
  HASHER=shasum
else
  HASHER=none
fi

fetch_quiet() {
  # fetch_quiet URL DEST
  case "$DOWNLOADER" in
    curl) curl -fsSL -o "$2" "$1" ;;
    wget) wget -q -O "$2" "$1" ;;
    *) fail "need curl or wget" ;;
  esac
}

fetch_shown() {
  # fetch_shown URL DEST
  case "$DOWNLOADER" in
    curl) curl -fSL --progress-bar -o "$2" "$1" ;;
    wget) wget -O "$2" "$1" ;;
    *) fail "need curl or wget" ;;
  esac
}

sha256_of() {
  case "$HASHER" in
    sha256sum) sha256sum "$1" | cut -d' ' -f1 ;;
    shasum) shasum -a 256 "$1" | cut -d' ' -f1 ;;
    *) fail "need sha256sum or shasum to verify downloads" ;;
  esac
}

human_size() {
  awk -v b="$1" 'BEGIN {
    if (b == "" || b + 0 <= 0) { print "unknown"; exit }
    if (b + 0 >= 1048576) { printf "%.1f MiB\n", b / 1048576; exit }
    if (b + 0 >= 1024) { printf "%.0f KiB\n", b / 1024; exit }
    printf "%d B\n", b
  }'
}

# --- prompts -----------------------------------------------------------------

# Reads from the terminal, not stdin: with `curl ... | sh` stdin is the script
# itself. Without a terminal the answer is no, and --no-confirm is the way
# through.
ask() {
  if [ "$NO_CONFIRM" -eq 1 ]; then
    return 0
  fi
  # In a subshell: with no controlling terminal, opening /dev/tty is a fatal
  # redirection error in some shells, and the subshell contains it.
  if ! ( : >/dev/tty ) 2>/dev/null; then
    say "No terminal to ask on. Re-run with --no-confirm to accept the defaults."
    return 1
  fi
  printf '%s [Y/n] ' "$1" >/dev/tty
  ask_reply=""
  read -r ask_reply </dev/tty 2>/dev/null || ask_reply=n
  case "$ask_reply" in
    ''|y|Y|yes|Yes|YES) return 0 ;;
    *) return 1 ;;
  esac
}

# --- manifest ----------------------------------------------------------------

# Flattens JSON to "dotted.path=value" lines, one per scalar. The manifest is
# small and machine-generated, so a scanner is enough and keeps the installer
# free of a jq dependency.
flatten_json() {
  awk '
  function skipws() {
    while (i <= n) {
      wc = substr(s, i, 1)
      if (wc == " " || wc == "\t" || wc == "\n" || wc == "\r") { i++ } else { return }
    }
  }
  function pstring(   out, ch) {
    i++
    out = ""
    while (i <= n) {
      ch = substr(s, i, 1)
      if (ch == "\\") {
        i++
        ch = substr(s, i, 1)
        if (ch == "n") { out = out "\n" }
        else if (ch == "t") { out = out "\t" }
        else { out = out ch }
        i++
        continue
      }
      if (ch == "\"") { i++; return out }
      out = out ch
      i++
    }
    return out
  }
  function pvalue(path,   ch, key, kp, idx, lit) {
    skipws()
    ch = substr(s, i, 1)
    if (ch == "{") {
      i++
      skipws()
      if (substr(s, i, 1) == "}") { i++; return }
      while (i <= n) {
        skipws()
        key = pstring()
        skipws()
        i++
        if (path == "") { kp = key } else { kp = path "." key }
        pvalue(kp)
        skipws()
        ch = substr(s, i, 1)
        i++
        if (ch == "}") { return }
      }
      return
    }
    if (ch == "[") {
      i++
      skipws()
      if (substr(s, i, 1) == "]") { i++; return }
      idx = 0
      while (i <= n) {
        pvalue(path "." idx)
        idx++
        skipws()
        ch = substr(s, i, 1)
        i++
        if (ch == "]") { return }
      }
      return
    }
    if (ch == "\"") {
      print path "=" pstring()
      return
    }
    lit = ""
    while (i <= n) {
      ch = substr(s, i, 1)
      if (ch == "," || ch == "}" || ch == "]" || ch == " " || ch == "\t" || ch == "\n" || ch == "\r") { break }
      lit = lit ch
      i++
    }
    print path "=" lit
  }
  { s = s $0 "\n" }
  END { n = length(s); i = 1; pvalue("") }
  ' "$1"
}

mf() {
  # mf KEY -> value, empty if absent
  printf '%s\n' "$MANIFEST_FLAT" |
    awk -v k="$1" 'index($0, k "=") == 1 { print substr($0, length(k) + 2); exit }'
}

mf_components() {
  printf '%s\n' "$MANIFEST_FLAT" | awk '
    index($0, "components.") == 1 {
      rest = substr($0, 12)
      p = index(rest, ".")
      if (p > 1) {
        name = substr(rest, 1, p - 1)
        if (!(name in seen)) { seen[name] = 1; print name }
      }
    }'
}

mf_targets() {
  # mf_targets COMPONENT -> one target triple per line
  printf '%s\n' "$MANIFEST_FLAT" | awk -v c="components.$1.targets." '
    index($0, c) == 1 {
      rest = substr($0, length(c) + 1)
      p = index(rest, ".")
      if (p > 1) {
        name = substr(rest, 1, p - 1)
        if (!(name in seen)) { seen[name] = 1; print name }
      }
    }'
}

resolve_url() {
  # Rewrites the manifest base URL when LUMEN_BASE_URL is set, so a local
  # mirror can stand in for the download host.
  if [ -n "$BASE_URL_OVERRIDE" ] && [ -n "$MANIFEST_BASE" ]; then
    case "$1" in
      "$MANIFEST_BASE"*) printf '%s\n' "${BASE_URL_OVERRIDE%/}${1#"$MANIFEST_BASE"}"; return ;;
    esac
  fi
  printf '%s\n' "$1"
}

# --- component sets ----------------------------------------------------------

set_has() {
  # set_has NAME SET
  case " $2 " in
    *" $1 "*) return 0 ;;
  esac
  return 1
}

set_add() {
  # set_add NAME SET -> SET with NAME appended once
  if set_has "$1" "$2"; then
    printf '%s\n' "$2"
  elif [ -z "$2" ]; then
    printf '%s\n' "$1"
  else
    printf '%s\n' "$2 $1"
  fi
}

set_remove() {
  # set_remove NAME SET
  printf '%s\n' "$2" | tr ' ' '\n' | awk -v drop="$1" '$0 != "" && $0 != drop' |
    tr '\n' ' ' | sed 's/ *$//'
}

apply_spec() {
  # apply_spec SPEC SET, entries are add:NAME or remove:NAME separated by ";"
  as_set="$2"
  set -f
  old_ifs="$IFS"
  IFS=';'
  for entry in $1; do
    IFS="$old_ifs"
    entry="$(printf '%s' "$entry" | tr -d ' \t')"
    case "$entry" in
      '') ;;
      add:*)
        as_name="${entry#add:}"
        [ -n "$as_name" ] || fail "empty component name in --components"
        as_set="$(set_add "$as_name" "$as_set")"
        ;;
      remove:*)
        as_name="${entry#remove:}"
        [ -n "$as_name" ] || fail "empty component name in --components"
        as_set="$(set_remove "$as_name" "$as_set")"
        ;;
      *)
        fail "bad --components entry: $entry (expected add:NAME or remove:NAME)"
        ;;
    esac
    IFS=';'
  done
  IFS="$old_ifs"
  set +f
  printf '%s\n' "$as_set"
}

# --- receipts ----------------------------------------------------------------
#
# One receipt per installed component:
#
#   version 0.1.0
#   target linux-x86_64
#   file bin/lumenc
#   file lib/liblumen.so

receipt_path() { printf '%s\n' "$RECEIPT_DIR/$1.receipt"; }

receipt_version() {
  rv_file="$(receipt_path "$1")"
  [ -f "$rv_file" ] || return 0
  awk '$1 == "version" { print $2; exit }' "$rv_file"
}

receipt_files() {
  rf_file="$(receipt_path "$1")"
  [ -f "$rf_file" ] || return 0
  awk '$1 == "file" { print substr($0, 6) }' "$rf_file"
}

prune_dirs() {
  # Removes directories left empty by a removal. rmdir refuses non-empty ones.
  [ -d "$PREFIX" ] || return 0
  find "$PREFIX" -depth -type d -exec rmdir {} + 2>/dev/null || true
}

# --- uninstall ---------------------------------------------------------------

do_uninstall() {
  if [ ! -d "$RECEIPT_DIR" ]; then
    say "Nothing to uninstall: no Lumen install found at $PREFIX"
    exit 0
  fi
  un_found=""
  for un_receipt in "$RECEIPT_DIR"/*.receipt; do
    [ -f "$un_receipt" ] || continue
    un_name="$(basename "$un_receipt" .receipt)"
    un_found="$un_found $un_name"
  done
  if [ -z "$un_found" ]; then
    say "Nothing to uninstall: no receipts under $RECEIPT_DIR"
    exit 0
  fi

  say "Removing from $PREFIX:"
  for un_name in $un_found; do
    say "  $un_name $(receipt_version "$un_name")"
  done
  if ! ask "Remove these?"; then
    say "Cancelled."
    exit 1
  fi

  for un_name in $un_found; do
    receipt_files "$un_name" | while IFS= read -r un_rel; do
      [ -n "$un_rel" ] || continue
      rm -f "$PREFIX/$un_rel"
    done
    rm -f "$(receipt_path "$un_name")"
  done
  prune_dirs
  say "Removed. If a PATH line for $BIN_DIR is still in a shell rc file, delete it by hand."
  exit 0
}

if [ "$UNINSTALL" -eq 1 ]; then
  do_uninstall
fi

# --- platform ----------------------------------------------------------------

UNAME_S="$(uname -s)"
UNAME_M="$(uname -m)"

case "$UNAME_S" in
  Linux) OS=linux ;;
  Darwin) OS=macos ;;
  MINGW*|MSYS*|CYGWIN*|Windows_NT) OS=windows ;;
  *) fail "unsupported operating system: $UNAME_S. Lumen ships for Linux and macOS." ;;
esac

case "$UNAME_M" in
  x86_64|amd64) ARCH=x86_64 ;;
  aarch64|arm64) ARCH=aarch64 ;;
  *) fail "unsupported architecture: $UNAME_M. Lumen ships for x86_64 and aarch64." ;;
esac

TARGET="$OS-$ARCH"

[ "$DOWNLOADER" != none ] || fail "need curl or wget"
[ "$HASHER" != none ] || fail "need sha256sum or shasum to verify downloads"

# --- fetch the manifest ------------------------------------------------------

if [ -n "$PIN_VERSION" ]; then
  case "$MANIFEST_URL" in
    */*) MANIFEST_URL="${MANIFEST_URL%/*}/manifest-$PIN_VERSION.json" ;;
    *) MANIFEST_URL="manifest-$PIN_VERSION.json" ;;
  esac
fi

TMP="$(mktemp -d "${TMPDIR:-/tmp}/lumen-install.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT HUP INT TERM

if ! fetch_quiet "$MANIFEST_URL" "$TMP/manifest.json"; then
  if [ -n "$PIN_VERSION" ]; then
    fail "no manifest for version $PIN_VERSION at $MANIFEST_URL (each release publishes manifest-<version>.json beside manifest.json)"
  fi
  fail "could not fetch the release manifest at $MANIFEST_URL"
fi

MANIFEST_FLAT="$(flatten_json "$TMP/manifest.json")"
[ -n "$MANIFEST_FLAT" ] || fail "the release manifest at $MANIFEST_URL is empty or not JSON"

SCHEMA="$(mf schema_version)"
[ -n "$SCHEMA" ] || fail "the release manifest has no schema_version"
if [ "$SCHEMA" != "$SUPPORTED_SCHEMA" ]; then
  fail "manifest schema_version $SCHEMA is newer than this installer understands ($SUPPORTED_SCHEMA). Fetch the current installer from https://lumenfx.dev/install.sh"
fi

CHANNEL="$(mf channel)"
RELEASE="$(mf version)"
MANIFEST_BASE="$(mf base_url)"
MANIFEST_BASE="${MANIFEST_BASE%/}"

if [ "$OS" = windows ]; then
  WIN_URL="$(mf "components.lumen.targets.windows-$ARCH.url")"
  say "This installer covers Linux and macOS."
  if [ -n "$WIN_URL" ]; then
    say "For Windows, download and unpack:"
    say "  $(resolve_url "$WIN_URL")"
  else
    say "A Windows build is not published for $ARCH yet. See https://lumenfx.dev"
  fi
  exit 1
fi

# --- resolve the component set -----------------------------------------------

WANTED=""
for comp in $(mf_components); do
  if [ "$(mf "components.$comp.default")" = true ]; then
    WANTED="$(set_add "$comp" "$WANTED")"
  fi
done

if [ -n "$SPEC" ]; then
  WANTED="$(apply_spec "$SPEC" "$WANTED")"
fi

[ -n "$WANTED" ] || fail "no components selected"

ALL_COMPONENTS="$(mf_components | tr '\n' ' ')"
for comp in $WANTED; do
  set_has "$comp" "$ALL_COMPONENTS" ||
    fail "unknown component: $comp (manifest has: $(printf '%s' "$ALL_COMPONENTS" | sed 's/ *$//'))"
  if [ -z "$(mf "components.$comp.targets.$TARGET.url")" ]; then
    fail "component $comp has no build for $TARGET (published: $(mf_targets "$comp" | tr '\n' ' ' | sed 's/ *$//'))"
  fi
done

# --- plan --------------------------------------------------------------------

PLAN=""
for comp in $WANTED; do
  comp_version="$(mf "components.$comp.targets.$TARGET.version")"
  [ -n "$comp_version" ] || comp_version="$RELEASE"
  if [ "$FORCE" -eq 0 ] && [ "$(receipt_version "$comp")" = "$comp_version" ]; then
    continue
  fi
  PLAN="$(set_add "$comp" "$PLAN")"
done

say ""
say "Lumen toolchain installer"
say ""
say "  channel   ${CHANNEL:-unknown}"
say "  release   ${RELEASE:-unknown}"
say "  target    $TARGET"
say "  prefix    $PREFIX"
say ""

if [ -z "$PLAN" ]; then
  say "Already up to date:"
  for comp in $WANTED; do
    say "  $comp $(receipt_version "$comp")"
  done
  say ""
  say "Use --force to reinstall."
  exit 0
fi

say "Components:"
for comp in $PLAN; do
  comp_version="$(mf "components.$comp.targets.$TARGET.version")"
  [ -n "$comp_version" ] || comp_version="$RELEASE"
  comp_size="$(mf "components.$comp.targets.$TARGET.size")"
  comp_desc="$(mf "components.$comp.description")"
  installed="$(receipt_version "$comp")"
  size_note=""
  if [ -n "$comp_size" ] && [ "$comp_size" != 0 ]; then
    size_note=" ($(human_size "$comp_size"))"
  fi
  if [ -n "$installed" ]; then
    say "  $comp $installed -> $comp_version$size_note"
  else
    say "  $comp $comp_version$size_note"
  fi
  [ -z "$comp_desc" ] || say "      $comp_desc"
done
say ""

if ! ask "Install these?"; then
  say "Cancelled. Nothing was written."
  exit 1
fi

# --- download and verify -----------------------------------------------------

mkdir -p "$TMP/dl"
for comp in $PLAN; do
  comp_url="$(resolve_url "$(mf "components.$comp.targets.$TARGET.url")")"
  comp_sha="$(mf "components.$comp.targets.$TARGET.sha256")"
  comp_format="$(mf "components.$comp.targets.$TARGET.format")"
  [ -n "$comp_sha" ] || fail "manifest entry for $comp on $TARGET has no sha256"
  case "${comp_format:-tar.gz}" in
    tar.gz) ;;
    *) fail "component $comp on $TARGET is published as $comp_format, which this installer cannot unpack" ;;
  esac

  say "Downloading $comp"
  if ! fetch_shown "$comp_url" "$TMP/dl/$comp.tar.gz"; then
    fail "download failed: $comp_url"
  fi

  got="$(sha256_of "$TMP/dl/$comp.tar.gz")"
  if [ "$got" != "$comp_sha" ]; then
    fail "checksum mismatch for $comp
  expected $comp_sha
  got      $got
Nothing was installed. The download was corrupted or the file at $comp_url does not match the manifest."
  fi
done

# --- unpack and install ------------------------------------------------------

for comp in $PLAN; do
  comp_version="$(mf "components.$comp.targets.$TARGET.version")"
  [ -n "$comp_version" ] || comp_version="$RELEASE"
  root="$TMP/x/$comp"
  mkdir -p "$root"
  tar -xzf "$TMP/dl/$comp.tar.gz" -C "$root" || fail "could not unpack the $comp archive"

  # Tolerate one wrapping directory inside the archive.
  if [ ! -d "$root/bin" ]; then
    inner=""
    inner_count=0
    for candidate in "$root"/*; do
      [ -e "$candidate" ] || continue
      inner_count=$((inner_count + 1))
      inner="$candidate"
    done
    if [ "$inner_count" -eq 1 ] && [ -d "$inner/bin" ]; then
      root="$inner"
    fi
  fi
  [ -d "$root/bin" ] || fail "the $comp archive has no bin/ directory"

  ( cd "$root" && find . \( -type f -o -type l \) -print ) | sed 's|^\./||' | sort > "$TMP/files-$comp"
  [ -s "$TMP/files-$comp" ] || fail "the $comp archive is empty"

  say "Installing $comp $comp_version"
  while IFS= read -r rel; do
    dest="$PREFIX/$rel"
    mkdir -p "$(dirname "$dest")"
    rm -f "$dest"
    cp -p "$root/$rel" "$dest"
  done < "$TMP/files-$comp"

  # Files the previous version installed and this one does not.
  receipt_files "$comp" | sort > "$TMP/old-$comp" || true
  if [ -s "$TMP/old-$comp" ]; then
    comm -23 "$TMP/old-$comp" "$TMP/files-$comp" | while IFS= read -r stale; do
      [ -n "$stale" ] || continue
      rm -f "$PREFIX/$stale"
    done
  fi

  mkdir -p "$RECEIPT_DIR"
  {
    printf 'version %s\n' "$comp_version"
    printf 'target %s\n' "$TARGET"
    sed 's/^/file /' "$TMP/files-$comp"
  } > "$(receipt_path "$comp")"

  if [ -d "$BIN_DIR" ]; then
    for exe in "$BIN_DIR"/*; do
      [ -f "$exe" ] || continue
      chmod 755 "$exe"
    done
  fi
done

prune_dirs

# --- PATH --------------------------------------------------------------------

# The rc line keeps $PATH unexpanded on purpose: it is written to the file
# verbatim and expanded by the shell that reads it.
# shellcheck disable=SC2016
path_line_for() {
  case "$1" in
    */fish) printf 'set -gx PATH "%s" $PATH\n' "$BIN_DIR" ;;
    *) printf 'export PATH="%s:$PATH"\n' "$BIN_DIR" ;;
  esac
}

rc_file_for() {
  case "$1" in
    */fish) printf '%s\n' "$HOME/.config/fish/config.fish" ;;
    */zsh) printf '%s\n' "$HOME/.zshrc" ;;
    */bash)
      if [ "$OS" = macos ] && [ -f "$HOME/.bash_profile" ]; then
        printf '%s\n' "$HOME/.bash_profile"
      else
        printf '%s\n' "$HOME/.bashrc"
      fi
      ;;
    *) printf '%s\n' "$HOME/.profile" ;;
  esac
}

on_path=0
case ":$PATH:" in
  *":$BIN_DIR:"*) on_path=1 ;;
esac

say ""
if [ "$on_path" -eq 0 ]; then
  RC="$(rc_file_for "${SHELL:-/bin/sh}")"
  LINE="$(path_line_for "${SHELL:-/bin/sh}")"
  already=0
  if [ -f "$RC" ] && grep -q -F "$BIN_DIR" "$RC" 2>/dev/null; then
    already=1
  fi
  if [ "$already" -eq 1 ]; then
    say "$BIN_DIR is already in $RC. Open a new shell to pick it up."
  elif [ "$MODIFY_PATH" -eq 0 ]; then
    say "Add $BIN_DIR to your PATH:"
    say "  $LINE"
  elif ask "Add $BIN_DIR to your PATH in $RC?"; then
    mkdir -p "$(dirname "$RC")"
    {
      printf '\n# added by the Lumen installer\n'
      printf '%s\n' "$LINE"
    } >> "$RC"
    say "Added to $RC. Open a new shell, or run:"
    say "  $LINE"
  else
    say "Left your shell configuration alone. To use Lumen, add:"
    say "  $LINE"
  fi
fi

say ""
say "Installed under $PREFIX:"
for comp in $WANTED; do
  say "  $comp $(receipt_version "$comp")"
done
say ""
say "Get started:"
say "  lumenc new counter my-app"
say "  lumenc run my-app"
