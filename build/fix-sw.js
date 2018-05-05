/*
*
* Temporary fix for https://github.com/angular/angular/issues/21636
*
* Include in your project; run after the `ng build --prod` step by running `node location/of/this/script/fix-sw`
*
* Warning: removes any instances of setting EXISTING_CLIENTS_ONLY state, which will likely have adverse effects in some situations
*
*/

/*
* enter the value set as the --base-href flag when deploying to a live URL
* if not deploying to a live URL, and only running locally, set this to null, as the URL parsing fix will not be necessary
*/
// const SITE_BASE_HREF = 'https://whatsmappening.io/api/v1/';
const SITE_BASE_HREF = null;




/*
*
* Begin script
*
*/

const replace = require('replace-in-file');

const existingStateReplacements = {
  files: 'dist/ngsw-worker.js',
  from: /this\.state = DriverReadyState\.EXISTING_CLIENTS_ONLY;/g,
  to: '/*this.state = DriverReadyState.EXISTING_CLIENTS_ONLY;*/ ' +
  '// removing EXISTING_CLIENTS_ONLY state, as it behaves incorrectly in offline testing, both locally & on GitHub pages'
};

const baseHrefInstances = {
  files: 'dist/ngsw.json',
  from: '"' + SITE_BASE_HREF + 'index.html",',
  to: '"' + SITE_BASE_HREF + 'index.html", ' // whitespace-only change indicates that the baseHref was found, so we should make the URL fix
};

const serviceWorkerURLFix = {
  files: 'dist/ngsw-worker.js',
  from: /return parsed\.path;/g,
  to: '/*return parsed.path;*/ ' +
  'return url; ' +
  '// overriding default @angular/service-worker URL behavior, to handle routing bug angular/angular #21636'
};

try {
  const existingInstances = replace.sync(existingStateReplacements);
  console.log('Replacements of EXISTING_CLIENTS_ONLY states: ', existingInstances.join(', '));
}
catch(error) {
  console.error('Error occurred while replacing EXISTING_CLIENTS_ONLY states: ', error);
}

try {
  const foundBaseHref = replace.sync(baseHrefInstances);
  if (foundBaseHref && foundBaseHref.length > 0) {
    try {
      const override = replace.sync(serviceWorkerURLFix);
      console.log('Changes made: ', override.join(', '))
    }
    catch (error) {
      console.error('Error occurred while overriding default service worker URL behavior: ', error)
    }
  }
  else {
    console.log('baseHref was not set; no URL matching changes needed', foundBaseHref);
  }
}
catch (error) {
  console.error('Error occurred while looking for baseHref: ', error);
}
