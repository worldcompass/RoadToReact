import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./App.css";
import "./index.css";
import axios from "axios";
import { sortBy } from "lodash";
import classNames from "classnames";

const list = [
  {
    title: "React",
    url: "https://reactjs.org/",
    author: "Jordan Walke",
    num_comments: 3,
    points: 4,
    objectID: 0
  },
  {
    title: "Redux",
    url: "https://redux.js.org/",
    author: "Dan Abramov, Andrew Clark",
    num_comments: 2,
    points: 5,
    objectID: 1
  }
];

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, "title"),
  AUTHOR: list => sortBy(list, "author"),
  COMMENTS: list => sortBy(list, "num_comments").reverse(),
  POINTS: list => sortBy(list, "points").reverse()
};

const DEFAULT_QUERY = "react";
const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";
const DEFAUL_HPP = "10";
const PARAM_HPP = "hitsPerPage=";

//main component
const App = () => {
  const [searchTerm, setSearch] = useState(DEFAULT_QUERY);
  const [query, setQuery] = useState("react");
  const [newList, setList] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [results, setResults] = useState([]);
  const [searchKey, setSearchKey] = useState(query);
  const [error, setErrorMessage] = useState(null);
  const [sortKey, setSortKey] = useState("NONE");
  const [isSortReverse, setSortReverse] = useState(false);

  const [sortOnTitle, setSortOnTitle] = useState(false);
  const [sortOnAuthor, setSortOnAuthor] = useState(false);
  const [sortOnComments, setSortOnComments] = useState(false);
  const [sortOnPoints, setSortOnPoints] = useState(true);

  useEffect(() => {
    if (searchTerm.length) {
      setLoading(true);
      axios(
        `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAUL_HPP}`
      )
        .then(result => {
          const { hits } = result.data;
          const updatedHits = [...newList, ...hits];
          setList(updatedHits);
          setLoading(false);
          setResults(results => ({
            ...result.data,
            [searchKey]: { hits: updatedHits, page }
          }));
        })
        .catch(error => {
          setLoading(false);
          setError(true);
          setErrorMessage(error);
          console.log(error.message);
          console.log(error.lineNumber);
        });
    } else {
      setList(list);
    }

    setSearchKey(searchTerm);
  }, [searchTerm, page, searchKey]);

  //updating search string
  const onChange = event => {
    event.preventDefault();
    setQuery(event.target.value);
  };

  //event on click on start searching button
  const onStartSearch = event => {
    event.preventDefault();
    setSearch(query);
    setSearchKey(searchTerm);
    setList([]);
    setPage(0);
  };

  //dismiss button logic
  const onDismiss = id => {
    const { hits, page } = results[searchKey];
    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    setResults({ ...results, [searchKey]: { hits: updatedHits, page } });
  };

  //setting new sort option
  const onSort = sortKey => {
    setSortReverse(sortKey === sortKey && !isSortReverse);
    setSortKey(sortKey);

    if (sortKey === "NONE" || sortKey === "POINTS") {
      setSortOnTitle(false);
      setSortOnAuthor(false);
      setSortOnComments(false);
      setSortOnPoints(true);
    } else if (sortKey === "TITLE") {
      setSortOnTitle(true);
      setSortOnAuthor(false);
      setSortOnComments(false);
      setSortOnPoints(false);
    } else if (sortKey === "AUTHOR") {
      setSortOnTitle(false);
      setSortOnAuthor(true);
      setSortOnComments(false);
      setSortOnPoints(false);
    } else {
      setSortOnTitle(false);
      setSortOnAuthor(false);
      setSortOnComments(true);
      setSortOnPoints(false);
    }
  };

  return (
    <div className="page">
      <div className="interactions">
        <Search value={query} onChange={onChange} onClick={onStartSearch}>
          Search
        </Search>
      </div>
      {error && <div>something went wrong ... </div>}
      <div>
        {isLoading ? (
          <Loading />
        ) : (
          <Table
            list={
              (results && results[searchKey] && results[searchKey].hits) || []
            }
            onDismiss={onDismiss}
            sortKey={sortKey}
            onSort={onSort}
            isSortReverse={isSortReverse}
            sortOnTitle={sortOnTitle}
            sortOnAuthor={sortOnAuthor}
            sortOnComments={sortOnComments}
            sortOnPoints={sortOnPoints}
          />
        )}
      </div>
      {console.log(sortKey)}
      <div className="interactions">
        <ButtonWithLoading
          isLoading={isLoading}
          onClick={() => {
            setPage(page + 1);
          }}
        >
          More
        </ButtonWithLoading>
      </div>
    </div>
  );
};

//search component with form
const Search = ({ value, onChange, children, onClick }) => {
  useEffect(() => {
    if (input) {
      input.focus();
    }
  });

  let input;
  return (
    <form onSubmit={onClick}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        ref={el => (input = el)}
      />
      <button type="submit">{children}</button>
    </form>
  );
};

//table component which renders data from LIST
const Table = ({
  list,
  sortKey,
  onSort,
  onDismiss,
  isSortReverse,
  sortOnTitle,
  sortOnAuthor,
  sortOnComments,
  sortOnPoints
}) => {
  const sortedList = SORTS[sortKey](list);
  const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;

  return (
    <div className="table">
      <div className="table-header">
        <span style={largeColumn}>
          <Sort sortKey={"TITLE"} onSort={onSort} activeSortKey={sortKey}>
            {sortOnTitle ? (
              <ArrowWithIndicator isSortReverse={isSortReverse} />
            ) : null}
            Title
          </Sort>
        </span>
        <span style={midColumn}>
          <Sort sortKey={"AUTHOR"} onSort={onSort} activeSortKey={sortKey}>
            {sortOnAuthor ? (
              <ArrowWithIndicator isSortReverse={isSortReverse} />
            ) : null}
            Author
          </Sort>
        </span>
        <span style={smallColumn}>
          <Sort sortKey={"COMMENTS"} onSort={onSort} activeSortKey={sortKey}>
            {sortOnComments ? (
              <ArrowWithIndicator isSortReverse={isSortReverse} />
            ) : null}
            Comments
          </Sort>
        </span>
        <span style={smallColumn}>
          <Sort sortKey={"POINTS"} onSort={onSort} activeSortKey={sortKey}>
            {sortOnPoints ? (
              <ArrowWithIndicator isSortReverse={isSortReverse} />
            ) : null}
            Points
          </Sort>
        </span>
        <span style={smallColumn}>Archive</span>
      </div>

      {reverseSortedList.map(item => (
        <div key={item.objectID} className="table-row">
          <span style={largeColumn}>
            <a href={item.url}>{item.title}</a>
          </span>
          <span style={midColumn}>{item.author}</span>
          <span style={smallColumn}>{item.num_comments}</span>
          <span style={smallColumn}>{item.points}</span>
          <span style={smallColumn}>
            <Button
              onClick={() => onDismiss(item.objectID)}
              className="button-inline"
            >
              Dismiss
            </Button>
          </span>
        </div>
      ))}
    </div>
  );
};

const Sort = ({ sortKey, onSort, children, activeSortKey }) => {
  const sortClass = classNames("button-inline", {
    "button-active": sortKey === activeSortKey
  });

  return (
    <Button onClick={() => onSort(sortKey)} className="button-inline">
      {children}
    </Button>
  );
};

//step 1 sorting arrow HOC
const withIndicator = () => ({ isSortReverse, ...rest }) =>
  isSortReverse ? <ArrowUp /> : <ArrowDown {...rest} />;

//1.1
const ArrowUp = () => <i class="fas fa-arrow-up"></i>;
const ArrowDown = () => <i class="fas fa-arrow-down"></i>;

//loading component indicator
const ArrowWithIndicator = withIndicator();

//step 1. creating HOC with "with"
const withLoading = Component => ({ isLoading, ...rest }) =>
  isLoading ? <Loading /> : <Component {...rest} />;

//1.1 define loading component
const Loading = Component => <i class="fas fa-spinner"></i>;

//step 2. dismiss button component to use in Table
const Button = ({ onClick, className = "", children }) => (
  <button onClick={onClick} className={className} type="button">
    {children}
  </button>
);

//step 3
const ButtonWithLoading = withLoading(Button);

const largeColumn = { width: "60%" };
const midColumn = { width: "30%" };
const smallColumn = { width: "10%" };

export default App;

export { Button, Search, Table };
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
