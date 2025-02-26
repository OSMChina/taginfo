# web/lib/javascript.rb

def javascript(url)
    @javascript ||= []
    @javascript << Javascript.new(url)
end

def javascript_if_exists(url)
    return unless File.exist?("public/js/#{ url }.js")

    javascript url
end

def javascript_tags
    @javascript.flatten.uniq.map(&:to_html).join("\n")
end

def javascript_for(*ids)
    (@javascript ||= []) << Javascript.init(ids)
end

class Javascript

    @@js_files = {
        :taginfo   => [ 'taginfo' ],
        :d3        => [ 'd3/d3.min' ],
        :d3_cloud  => [ 'd3/d3.layout.cloud' ]
    }

    def self.init(ids)
        js = []
        ids.each do |id|
            @@js_files[id].each do |file|
                js << new(file)
            end
        end
        js
    end

    def initialize(file)
        if file.nil?
            c = ''
            r = yield c
            @content = (c == '' ? r : c)
        else
            @file = file
        end
    end

    def to_html
        if @file.nil?
            %(    <script type="text/javascript">\n#{ @content }\n</script>)
        else
            %(    <script type="text/javascript" src="/js/#{ @file }.js"></script>)
        end
    end

end
