with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find script block
script_start = content.find('<script>')
script_end = content.find('</script>')
script_block = content[script_start:script_end]

open_b = script_block.count('{')
close_b = script_block.count('}')
print('Global JS braces: open=', open_b, 'close=', close_b, 'balanced=', open_b==close_b)

# Check for any remaining syntax issues in the dropdown function area
start = content.find('filterPresensiHistory')
end = content.find('openModalPresensi(p = null)')
sub = content[start:end]
print('Local filter block braces: open=', sub.count('{'), 'close=', sub.count('}'))

# Check if HTML is broken (tags)
print('Select tag balanced?', content.count('<select') == content.count('</select>'))
print('Script tag balanced?', content.count('<script>') == content.count('</script>'))

# Check if any backslash chars remain accidentally
backslash_n = content.count('\\n')
print('Backslash-n remaining:', backslash_n)
