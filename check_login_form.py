with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()
# Extract login form region
start = content.find('id="view-login"')
end = content.find('id="view-app"')
region = content[start:end]
print('Login region length:', len(region))
# Check key inputs exist
for key in ['login-username', 'login-password', 'btn-login-submit', 'form-login']:
    print('Contains', key, ':', key in region)
# Show first 300 chars of region
print(region[:300])
