with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# We want to add document.body.classList.add('printing-dashboard') before html2canvas
# and remove it after.
def repl(match):
    return """
          document.body.classList.add('printing-dashboard');
          dashboard.style.width = '800px'; 
          
          await new Promise(resolve => requestAnimationFrame(resolve));
          const canvas = await html2canvas(dashboard, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            logging: false,
            onclone: (doc) => {
               // Additional tweaks for clone if needed
            }
          });
          
          dashboard.style.width = '';
          document.body.classList.remove('printing-dashboard');
"""

content = re.sub(r"const oldMax.*?dashboard\.style\.overflow = oldOver;", repl, content, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated index.html 2")
