import CETEI from 'CETEIcean';

export async function initializeDocument(docURL) {
  const CETEIcean = new CETEI();
  console.log(typeof formatDate);
  return CETEIcean.getHTML5(docURL).then((data) => {
    //document.getElementById('TEI').innerHTML = '';
    //document.getElementById('TEI').appendChild(data);
    console.log('we got xml', data);
  });
}
