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
  
  