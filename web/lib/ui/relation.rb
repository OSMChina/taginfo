# web/lib/ui/relations.rb
class Taginfo < Sinatra::Base

    get %r{/relations/(.*)} do |rtype|
        @rtype = if params[:rtype].nil?
                     rtype
                 else
                     params[:rtype]
                 end

        @rtype_uri = escape(@rtype)

        @title = [@rtype, t.osm.relations]
        section :relations

        @wiki_count = @db.count('wiki.relation_pages').condition('rtype=?', @rtype).get_first_i
        @count_all_values = @db.select("SELECT count FROM db.relation_types").condition('rtype = ?', @rtype).get_first_i

        @desc = wrap_description(t.pages.relation, get_relation_description(@rtype))

        @db.select("SELECT width, height, image_url, thumb_url_prefix, thumb_url_suffix FROM wiki.relation_pages LEFT OUTER JOIN wiki.wiki_images USING(image) WHERE lang=? AND rtype=? UNION SELECT width, height, image_url, thumb_url_prefix, thumb_url_suffix FROM wiki.relation_pages LEFT OUTER JOIN wiki.wiki_images USING(image) WHERE lang='en' AND rtype=? LIMIT 1", r18n.locale.code, @rtype, @rtype).
            execute do |row|
                @image_url = build_image_url(row)
            end

        @count_relation_roles = @db.count('relation_roles').condition("rtype=?", @rtype).get_first_i

        @context[:rtype] = @rtype

        @wikipages = @db.select("SELECT DISTINCT lang, title FROM wiki.relation_pages WHERE rtype=? ORDER BY lang", @rtype).execute.map do |row|
            lang = row['lang']
            {
                :lang    => lang,
                :title   => row['title'],
                :english => ::Language[lang].english_name,
                :native  => ::Language[lang].native_name,
                :dir     => direction_from_lang_code(lang)
            }
        end

        @wikipage_en = @wikipages.find{ |row| row[:lang] == 'en' }

        @projects_count = @db.select('SELECT count(distinct project_id) FROM projects.project_tags').condition("key='type' AND value=?", @rtype).get_first_i

        javascript_for(:d3)
        javascript "pages/relation"
        erb :relation
    end

end
