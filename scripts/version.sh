#!/usr/bin/env bash
set -euo pipefail

# Version management script for SetMeld Pod
# Usage: ./scripts/version.sh [get|set <version>|bump <type>]

VERSION_FILE="version.json"

# Function to get current version
get_version() {
    if [[ -f "$VERSION_FILE" ]]; then
        grep -o '"version": "[^"]*"' "$VERSION_FILE" | cut -d'"' -f4
    else
        echo "0.1.0-alpha.0"
    fi
}

# Function to set version
set_version() {
    local new_version="$1"
    if [[ -f "$VERSION_FILE" ]]; then
        # Update existing version.json
        sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$new_version\"/" "$VERSION_FILE"
        rm -f "$VERSION_FILE.bak"
    else
        # Create new version.json
        cat > "$VERSION_FILE" << EOF
{
  "version": "$new_version",
  "description": "SetMeld Pod version configuration"
}
EOF
    fi
    
    # Update package.json
    sed -i.bak "s/\"version\": \"[^\"]*\"/\"version\": \"$new_version\"/" package.json
    rm -f package.json.bak
    
    # Update nfpm.yaml
    sed -i.bak "s/version: \"[^\"]*\"/version: \"$new_version\"/" nfpm.yaml
    rm -f nfpm.yaml.bak
    
    # Update ansible deploy.yml
    sed -i.bak "s/setmeld_pod_version: \"[^\"]*\"/setmeld_pod_version: \"$new_version\"/" ansible/deploy.yml
    rm -f ansible/deploy.yml.bak
    
    # Update URLs in config files (extract major version and set minor/patch to 0)
    local major_version
    if [[ "$new_version" =~ ^([0-9]+)\. ]]; then
        major_version="${BASH_REMATCH[1]}"
        local url_version="$major_version.0.0"
        
        # Update URLs in all config files and package.json
        find config -name "*.json" -type f -exec sed -i.bak "s|linkedsoftwaredependencies\.org/bundles/npm/setmeld-pod/\^[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*|linkedsoftwaredependencies.org/bundles/npm/setmeld-pod/^$url_version|g" {} \;
        sed -i.bak "s|linkedsoftwaredependencies\.org/bundles/npm/setmeld-pod/\^[0-9][0-9]*\.[0-9][0-9]*\.[0-9][0-9]*|linkedsoftwaredependencies.org/bundles/npm/setmeld-pod/^$url_version|g" package.json
        find config -name "*.json.bak" -type f -delete
        rm -f package.json.bak
    fi
    
    echo "Version updated to: $new_version"
}

# Function to bump version
bump_version() {
    local current_version=$(get_version)
    local bump_type="$1"
    
    # Parse version components
    local major minor patch prerelease prerelease_version
    if [[ "$current_version" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)(-([a-zA-Z0-9.-]+))?$ ]]; then
        major="${BASH_REMATCH[1]}"
        minor="${BASH_REMATCH[2]}"
        patch="${BASH_REMATCH[3]}"
        prerelease="${BASH_REMATCH[4]}"
        prerelease_version="${BASH_REMATCH[5]}"
    else
        echo "Error: Invalid version format: $current_version"
        exit 1
    fi
    
    local new_version
    case "$bump_type" in
        "major")
            new_version="$((major + 1)).0.0"
            ;;
        "minor")
            new_version="$major.$((minor + 1)).0"
            ;;
        "patch")
            new_version="$major.$minor.$((patch + 1))"
            ;;
        "prerelease")
            if [[ -n "$prerelease_version" ]]; then
                # Extract prerelease type and number
                if [[ "$prerelease_version" =~ ^([a-zA-Z0-9.-]+)\.([0-9]+)$ ]]; then
                    local prerelease_type="${BASH_REMATCH[1]}"
                    local prerelease_num="${BASH_REMATCH[2]}"
                    new_version="$major.$minor.$patch-$prerelease_type.$((prerelease_num + 1))"
                else
                    new_version="$major.$minor.$patch-$prerelease_version.1"
                fi
            else
                new_version="$major.$minor.$patch-alpha.0"
            fi
            ;;
        *)
            echo "Error: Invalid bump type. Use: major, minor, patch, or prerelease"
            exit 1
            ;;
    esac
    
    set_version "$new_version"
}

# Main script logic
case "${1:-get}" in
    "get")
        get_version
        ;;
    "set")
        if [[ -z "${2:-}" ]]; then
            echo "Error: Version required for 'set' command"
            echo "Usage: $0 set <version>"
            exit 1
        fi
        set_version "$2"
        ;;
    "bump")
        if [[ -z "${2:-}" ]]; then
            echo "Error: Bump type required for 'bump' command"
            echo "Usage: $0 bump <major|minor|patch|prerelease>"
            exit 1
        fi
        bump_version "$2"
        ;;
    *)
        echo "Usage: $0 [get|set <version>|bump <type>]"
        echo ""
        echo "Commands:"
        echo "  get                    - Get current version"
        echo "  set <version>          - Set version to specific value"
        echo "  bump <type>            - Bump version (major|minor|patch|prerelease)"
        echo ""
        echo "Examples:"
        echo "  $0 get"
        echo "  $0 set 1.0.0"
        echo "  $0 set 0.2.0-beta.1"
        echo "  $0 bump patch"
        echo "  $0 bump prerelease"
        exit 1
        ;;
esac
