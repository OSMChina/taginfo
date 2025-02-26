#!/usr/bin/env bash
#------------------------------------------------------------------------------
#
#  Taginfo source: Wiki
#
#  update.sh DATADIR
#
#------------------------------------------------------------------------------

set -euo pipefail

SRCDIR=$(dirname "$(readlink -f "$0")")
readonly SRCDIR

readonly DATADIR=$1

if [ -z "$DATADIR" ]; then
    echo "Usage: update.sh DATADIR"
    exit 1
fi

readonly DATABASE=$DATADIR/taginfo-wiki.db
readonly CACHE_PAGES_DB=$DATADIR/wikicache.db
readonly CACHE_IMAGES_DB=$DATADIR/wikicache-images.db
readonly LOGFILE_GET_PAGE_LIST=$DATADIR/get_page_list.log
readonly LOGFILE_WIKI_DATA=$DATADIR/get_wiki_data.log
readonly LOGFILE_IMAGE_INFO=$DATADIR/get_image_info.log

# shellcheck source=/dev/null
source "$SRCDIR/../util.sh" wiki

initialize_cache() {
    if [ ! -e "$CACHE_PAGES_DB" ]; then
        run_sql "$CACHE_PAGES_DB" "$SRCDIR/cache.sql"
    fi
    if [ ! -e "$CACHE_IMAGES_DB" ]; then
        run_sql "$CACHE_IMAGES_DB" "$SRCDIR/cache-images.sql"
    fi
}

get_page_list() {
    print_message "Getting page list..."
    rm -f "$DATADIR/all_wiki_pages.list"
    rm -f "$DATADIR/interesting_wiki_pages.list"
    run_ruby "-l$LOGFILE_GET_PAGE_LIST" "$SRCDIR/get_page_list.rb" "$DATADIR"
}

get_wiki_data() {
    print_message "Getting wiki data..."
    run_ruby "-l$LOGFILE_WIKI_DATA" "$SRCDIR/get_wiki_data.rb" "$DATADIR"

    print_message "Getting image info..."
    run_ruby "-l$LOGFILE_IMAGE_INFO" "$SRCDIR/get_image_info.rb" "$DATADIR"
}

get_links() {
    print_message "Getting links to Key/Tag/Relation pages..."
    run_ruby "-l$DATADIR/links.list" "$SRCDIR/get_links.rb" "$DATADIR"

    print_message "Classifying links..."
    run_ruby "$SRCDIR/classify_links.rb" "$DATADIR"
}

extract_words() {
    print_message "Extracting words..."
    run_ruby "$SRCDIR/extract_words.rb" "$DATADIR"
}

main() {
    print_message "Start wiki..."

    initialize_database "$DATABASE" "$SRCDIR"
    initialize_cache
    get_page_list
    get_wiki_data
    #get_links
    extract_words
    finalize_database "$DATABASE" "$SRCDIR"

    print_message "Done wiki."
}

main

