import fetch from "../util/fetch-fill";
import URI from "urijs";

const PRIMARY_COLORS = ['red', 'blue', 'yellow'];
const MAXPAGE = 50;

// /records endpoint
window.path = "http://localhost:3000/records";

// Your retrieve function plus any additional functions go here ...
const getIds = (res) => res.map(item => item.id);

const getOpenItems = (res) => {
  return res.filter(item => item.disposition === 'open')
    .map(val => {
      PRIMARY_COLORS.includes(val.color) ? val.isPrimary = true : val.isPrimary = false;
      return val;
    });
};

const getClosedItemCount = (res) => res.filter(item => item.disposition === 'closed' && PRIMARY_COLORS.includes(item.color)).length;

const getPrevNextPage = ((currentPage, res) => {
  return {
    previousPage: currentPage === 1 ? null : currentPage - 1,
    nextPage: (currentPage >= MAXPAGE || res.length < 10) ? null : currentPage + 1
  };
})

const transformResponse = (res, currentPage) => {
  return {
    ids: getIds(res),
    open: getOpenItems(res),
    closedPrimaryCount: getClosedItemCount(res),
    previousPage: getPrevNextPage(currentPage, res).previousPage,
    nextPage: getPrevNextPage(currentPage, res).nextPage
  };
};

function retrieve(params) {
  const page = params && params.page ? params.page : 1;
  const offset = (page - 1) * 10;
  const queryParams = {
    limit: 10,
    offset,
    ...(params && params.colors && { 'color[]': params.colors })
  }
  return new Promise((resolve) => {
    let res;
    const fetchURL = new URI(window.path).search(queryParams).toString();
    res = fetch(fetchURL)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          throw res
        }
      })
      .then(res => {
        resolve(transformResponse(res, page))
      })
      .catch(err => {
        console.log(err)
        resolve({})
      });
  });
}

export default retrieve;
