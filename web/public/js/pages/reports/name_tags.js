function tt(text, c, title) {
    return tag('tt', text, { 'class': c, 'title': title, 'data-tooltip-position': 'OnLeft' });
}

const tabsConfig = {
    overview: function() {
        return new DynamicTable('grid-name', {
            url: '/api/0/keys/name',
            colModel: [
                { display: h(texts.osm.key), name: 'key', width: 250, sortable: true },
                { display: h(texts.osm.objects), name: 'count_all', width: 100, sortable: true, align: 'right' },
                { display: h(texts.taginfo.wiki), name: 'in_wiki', width: 20, sortable: true, align: 'center', title: h(texts.misc.in_wiki_tooltip) },
                { display: 'Prefix', name: 'prefix', width: 100, sortable: true },
                { display: 'Type', name: 'type', width: 100, sortable: true },
                { display: 'Langtag', name: 'langtag', width: 100, sortable: true },
                { display: 'Language', name: 'lang', width: 100, sortable: true },
                { display: 'Script', name: 'script', width: 100, sortable: true },
                { display: 'Region', name: 'region', width: 100, sortable: true },
                { display: 'Notes', name: 'notes', width: 500, sortable: true }
            ],
            searchitems: [
                { display: h(texts.osm.key), name: 'key' }
            ],
            sortname: 'count_all',
            sortorder: 'desc',
            processRow: row => {
                const key = new TaginfoKey(row.key);
                return [
                    key.link(),
                    fmt_with_ts(row.count_all),
                    key.link({ tab: 'wiki', content: fmt_checkmark(row.in_wiki) }),
                    row.prefix,
                    row.type,
                    row.langtag,
                    tt(row.lang, row.lang_state, row.lang_note),
                    tt(row.script, row.script_state, row.script_note),
                    row.region,
                    row.notes
                ];
            }
        });
    }
};

function page_init() {
    initTabs(tabsConfig);
}
