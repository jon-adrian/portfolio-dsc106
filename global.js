console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}


let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' },
    { url: 'https://github.com/jon-adrian', title: 'GitHub' },
  ];
  
  let BASE_PATH = location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1'
    ? '/'
    : '/portfolio-dsc106/';

  let nav = document.createElement('nav');
  document.body.prepend(nav);
  

  for (let p of pages) {
    let url = p.url.startsWith('http')
      ? p.url
      : BASE_PATH + p.url;
  
    let title = p.title;
  
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
  
    if (a.host === location.host &&
        a.pathname === location.pathname.replace(/index\.html$/, '')) {
      a.classList.add('current');
    }
  
    if (a.host !== location.host) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  
    nav.append(a);
  }
  
  
document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
        Theme:
        <select>
          <option value="light dark">Automatic</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    `
  );



  let select = document.querySelector('.color-scheme select');

  // Retrieve the previously saved theme
  let savedTheme = localStorage.getItem('colorScheme') || 'light dark';
  
  // Apply the saved theme
  document.documentElement.style.colorScheme = savedTheme;
  
  // Make the dropdown display the saved selection
  select.value = savedTheme;
  
  // Update and save the theme whenever it changes
  select.addEventListener('input', function (event) {
    let theme = event.target.value;
  
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem('colorScheme', theme);
  });


  let form = document.querySelector('form');

  form?.addEventListener('submit', function(event) {
    event.preventDefault();
  
    let data = new FormData(form);
    let params = [];
  
    for (let [name, value] of data) {
      params.push(`${name}=${encodeURIComponent(value)}`);
    }
  
    let url = form.action + '?' + params.join('&');
  
    location.href = url;
  });
  
  