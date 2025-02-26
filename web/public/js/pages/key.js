const tabsConfig = {
    overview: function(key, filter_type) {
        return [
            new DynamicTable('grid-overview', {
                url: '/api/4/key/stats',
                params: { key: key },
                colModel: [
                    { display: h(texts.misc.object_type), name: 'type' },
                    { display: h(texts.pages.key.number_objects), name: 'count', align: 'center' },
                    { display: h(texts.osm.values), name: 'value', align: 'right' }
                ],
                usePager: false,
                processRow: row => [
                    fmt_type_image(row.type),
                    tag('div',
                        tag('div', fmt_with_ts(row.count), { 'class': 'value' }) +
                        tag('div', fmt_as_percent(row.count_fraction), { 'class': 'fraction' }),
                        { 'class': 'value-fraction' }),
                    fmt_with_ts(row.values)
                ]
            }),
            new ChartChronology('overview-chronology', build_link('/api/4/key/chronology', { key: key }), filter.value, 190),
            new ChartValues(key, filter_type, context.countAllValues)
        ];
    },
    values: function(key, filter_type, lang) {
        return new DynamicTable('grid-values', {
            url: '/api/4/key/values',
            csv: true,
            params: { key: key, filter: filter_type, lang: lang },
            colModel: [
                { display: h(texts.osm.value), name: 'value', width: 140, sortable: true },
                { display: h(texts.misc.count), name: 'count', width: 230, sortable: true, align: 'center' },
                { display: h(texts.taginfo.wiki), name: 'in_wiki', width: 25, sortable: true, align: 'center', title: h(texts.misc.in_wiki_tooltip) },
                { display: h(texts.misc.description), name: 'description', width: 200, title: h(texts.pages.key.tag_description_from_wiki) }
            ],
            searchitems: [
                { display: h(texts.osm.value), name: 'value' }
            ],
            sortname: 'count',
            sortorder: 'desc',
            processRow: row => [
                hover_expand(key.toTag(row.value).link()),
                fmt_value_with_percent(row.count, row.fraction),
                key.toTag(row.value).link({tab: 'wiki', content: fmt_checkmark(row.in_wiki)}),
                fmt_desc(row.desclang, row.descdir, row.description)
            ]
        });
    },
    combinations: function(key, filter_type) {
        return new DynamicTable('grid-combinations', {
            url: '/api/4/key/combinations',
            csv: true,
            params: { key: key, filter: filter_type },
            colModel: [
                { display: h(texts.misc.count) + ' &rarr;', name: 'to_count', width: 250, sortable: true, align: 'center', title: h(texts.pages.key.other_keys_used.to_count_tooltip) },
                { display: h(texts.pages.key.other_keys_used.other), name: 'other_key', width: 140, sortable: true, title: h(texts.pages.key.other_keys_used.other_key_tooltip) },
                { display: '&rarr; ' + h(texts.misc.count), name: 'from_count', width: 250, sortable: true, align: 'center', title: h(texts.pages.key.other_keys_used.from_count_tooltip) }
            ],
            searchitems: [
                { display: h(texts.pages.key.other_keys_used.other), name: 'other_key' }
            ],
            sortname: 'to_count',
            sortorder: 'desc',
            processRow: row => {
                const otherKey = new TaginfoKey(row.other_key);
                return [
                    fmt_value_with_percent(row.together_count, row.to_fraction),
                    hover_expand(otherKey.link()),
                    fmt_value_with_percent(row.together_count, row.from_fraction),
                ];
            }
        });
    },
    similar: function(key) {
        return new DynamicTable('grid-similar', {
            url: '/api/4/key/similar',
            csv: true,
            params: { key: key },
            colModel: [
                { display: h(texts.pages.key.similar.other), name: 'other_key', width: 300, sortable: true },
                { display: h(texts.misc.count), name: 'count_all', width: 60, sortable: true, align: 'right', title: h(texts.pages.key.similar.count_all_tooltip) },
                { display: h(texts.pages.key.similar.similarity), name: 'similarity', width: 60, sortable: true, align: 'right', title: h(texts.pages.key.similar.similarity_tooltip) }
            ],
            searchitems: [
                { display: h(texts.pages.key.similar.other), name: 'other_key' }
            ],
            sortname: 'other_key',
            sortorder: 'asc',
            processRow: row => {
                const otherKey = new TaginfoKey(row.other_key);
                return [
                    hover_expand(otherKey.link({ highlight: key })),
                    row.count_all,
                    row.similarity
                ];
            }
        });
    },
    chronology: function(key) {
        return new ChartChronology('chart-chronology', build_link('/api/4/key/chronology', { key: key }), filter.value, 400);
    },
    wiki: function(key, filter_type) {
        return new DynamicTable('grid-wiki', {
            url: '/api/4/key/wiki_pages',
            params: { key: key },
            colModel: [
                { display: h(texts.misc.language), name: 'lang', width: 100 },
                { display: h(texts.pages.key.wiki_pages.wiki_page), name: 'title', width: 140, align: 'right' },
                { display: h(texts.misc.description), name: 'description', width: 300 },
                { display: h(texts.misc.image), name: 'image', width: 100 },
                { display: h(texts.osm.objects), name: 'objects', width:  80 },
                { display: h(texts.misc.status), name: 'status', width: 70, title: h(texts.misc.approval_status) },
                { display: h(texts.pages.key.wiki_pages.implied_tags), name: 'tags_implied', width: 120 },
                { display: h(texts.pages.key.wiki_pages.combined_tags), name: 'tags_combination', width: 120 },
                { display: h(texts.pages.key.wiki_pages.linked_tags), name: 'tags_linked', width: 220 }
            ],
            usePager: false,
            processRow: row => {
                const wikiPage = new TaginfoWikiPage(row.title);
                return [
                    fmt_language(row.lang, row.dir, row.language, row.language_en),
                    wikiPage.link(),
                    fmt_desc(row.lang, row.dir, row.description),
                    fmt_wiki_image_popup(row.image),
                    fmt_type_icon('node',     row.on_node) +
                    fmt_type_icon('way',      row.on_way) +
                    fmt_type_icon('area',     row.on_area) +
                    fmt_type_icon('relation', row.on_relation),
                    fmt_status(row.status),
                    fmt_key_or_tag_list(row.tags_implies),
                    fmt_key_or_tag_list(row.tags_combination),
                    fmt_key_or_tag_list(row.tags_linked)
                ];
            }
        });
    },
    projects: function(key, filter_type) {
        return new DynamicTable('grid-projects', {
            url: '/api/4/key/projects',
            csv: true,
            params: { key: key, filter: filter_type },
            colModel: [
                { display: h(texts.taginfo.project), name: 'project_name', width: 250, sortable: true },
                { display: h(texts.osm.tag), name: 'tag', width: 200, sortable: true },
                { display: h(texts.osm.objects), name: 'objects', width:  80 },
                { display: h(texts.pages.key.projects.description), name: 'description', width: 200 }
            ],
            searchitems: [
                { display: h(texts.taginfo.project) + '/' + h(texts.osm.value), name: 'project_value' }
            ],
            sortname: 'tag',
            sortorder: 'asc',
            processRow: row => {
                const project = new TaginfoProject(row.project_id, row.project_name);
                const rowKeyOrTag = createKeyOrTag(row.key, row.value);
                return [
                    hover_expand(project.link()),
                    hover_expand(rowKeyOrTag.fullLink({ with_asterisk: true })),
                    fmt_type_icon('node',     row.on_node) +
                    fmt_type_icon('way',      row.on_way) +
                    fmt_type_icon('area',     row.on_area) +
                    fmt_type_icon('relation', row.on_relation),
                    fmt_project_tag_desc(row.description, row.icon_url, row.doc_url)
                ];
            }
        });
    },
    characters: function(key, filter_type) {
        return createCharactersTable(key);
    }
};

class ChartValues {
    id = 'chart-values';
    key;
    url;
    data;
    countAllValues;

    constructor(key, filter, countAllValues) {
        this.key = key;
        this.url = build_link('/api/4/key/prevalent_values', { min_fraction: 0.002, key: key, filter: filter });
        this.countAllValues = countAllValues;
    }

    async load() {
        const response = await fetch(this.url);
        const json = await response.json();
        this.data = json.data;
        this.draw();
    }

    draw() {
        const width = 300;
        const height = 200;

        const key = this.key;
        const tree_data = {
            name: '',
            children: this.data.map(function(d) {
                var name = d.value || '';
                // add soft hyphens in places where it is good to break the text if needed
                const display_name = d.fraction > 0.01 ? name.replaceAll(new RegExp('([^a-zA-Z])', 'g'), '\u200b$1\u200b').replaceAll(new RegExp('([a-z])([A-Z])', 'g'), '$1\u200b$2') : '';
                if (name.length > 30) {
                    name = name.substring(0, 30) + '\u2026';
                }
                return {
                    tag_value: d.value,
                    display_name: display_name,
                    rest: d.value === null,
                    value: d.count,
                    fraction: d.fraction,
                    name: (name || h(texts.pages.key.overview.all_other_values)),
                    formatted_count: fmt_with_ts(d.count) + ' (' + fmt_as_percent(d.fraction) + ')',
                };
            })
        }

        const color = d3.scaleOrdinal(tree_data.children.map((d, i) => i), d3.schemePastel1);

        const root = d3.treemap()
            .size([width, height])
            .padding(1)
            .round(true)
        (d3.hierarchy(tree_data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));

        set_inner_html_to('distribution-of-values', '');
        const treemap = d3.select('#distribution-of-values').append('div')
            .classed('treemap', true);

        treemap.selectAll('a')
            .data(root.leaves())
            .join('a')
            .classed('treemap-item', true)
            .classed('treemap-rest', d => d.data.rest)
            .attr('style', (d, i) => `width: ${d.x1 - d.x0}px; height: ${d.y1 - d.y0}px; background-color: ${color(i)}; left: ${d.x0}px; top: ${d.y0}px`)
          .call(selection => {
              selection.append('div')
                .classed('treemap-popup', true)
                  .attr('style', (d, i) => `transform: translate(-${d.x0}px, -${d.y0}px)`)
                  .call(selection => {
                      selection.append('div')
                        .text(d => d.data.name);
                  })
                  .call(selection => {
                      selection.append('div')
                        .text(d => d.data.formatted_count);
                  })
              selection.append('div')
                  .attr('style', (d, i) => `width: ${d.x1 - d.x0 - 2}px; height: ${d.y1 - d.y0 - 2}px;`)
                  .classed('treemap-label', true)
                  .attr('lang', 'en') // most popular tag values are in English, say so to use English hyphenation
                  .text(d => d.data.display_name);
          })

        treemap.selectAll('.treemap-item:not(.treemap-rest)')
            .attr('href', d => key.toTag(d.data.tag_value).url())
    }

    resize() {
        this.draw();
    }
} // class ChartValues

function page_init() {
    const key = new TaginfoKey(context.key);

    activateJOSMButton();

    const filter = document.getElementById('filter');
    filter.addEventListener('change', function(element) {
        if (element.target.value != 'all') {
            key.params.filter = element.target.value;
        }
        if (window.location.hash != '') {
            key.tab = window.location.hash.substring(1);
        }
        window.location = key.url();
    });

    activateTagHistoryButton([{ type: filter.value, key: context.key }]);
    activateOhsomeButton(filter.value, context.key);

    document.querySelector('h1').innerHTML = key.content();

    new ComparisonListDisplay(key);

    initTabs(tabsConfig, [key, filter.value, context.lang]);
}
