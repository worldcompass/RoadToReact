import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./App.css";
import "./index.css";

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

const DEFAULT_QUERY = "redux";
const PATH_BASE = "https://hn.algolia.com/api/v1";
const PATH_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";
const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}&${PARAM_PAGE}`;

//main component
const App = () => {
  const [searchTerm, setSearch] = useState("react");
  const [query, setQuery] = useState("react");
  const [newList, setList] = useState(list);
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    // page = (newList && newList.page) || 0;

    if (searchTerm.length) {
      setLoading(true);

      fetch(
        `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`
      )
        .then(response => response.json())
        .then(result => {
          setList(result.hits);
          setLoading(false);
        })
        .catch(error => {
          error;
          setLoading(false);
          setError(true);
        });
      console.log(page);
    } else {
      setList(list);
    }
  }, [searchTerm, page]);

  //updating search string
  const onChange = event => {
    event.preventDefault();
    setQuery(event.target.value);
  };

  //event on click on start searching button
  const onStartSearch = event => {
    event.preventDefault();
    setSearch(query);
  };

  // const fetchSearchTopStories = () => {
  //   setPage((page)=>page++);
  //   // setSearch(query);
  // };

  //dismiss button logic
  const onDismiss = id => {
    const isNotId = item => item.objectID !== id;
    setList(newList.filter(isNotId));
  };

  return (
    <div className="page">
      <div className="interactions">
        <Search value={query} onChange={onChange} onClick={onStartSearch}>
          Search
        </Search>
      </div>
      {isError && <div>something went wrong ... </div>}
      <div>
        {isLoading ? (
          <div>Loading ... </div>
        ) : (
          <Table list={newList} onDismiss={onDismiss} />
        )}
      </div>
      <div className="interactions">
        <button onClick={() => setPage(page + 1)}>More</button>
      </div>
    </div>
  );
};

//search component with form
const Search = ({ value, onChange, children, onClick }) => (
  <form onSubmit={onClick}>
    {children} <input type="text" value={value} onChange={onChange} />
    <button type="submit">start searching</button>
  </form>
);

//table component which renders data from LIST
const Table = ({ list, onDismiss }) => (
  <div className="table">
    {list.map(item => (
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

//dismiss button component to use in Table
const Button = ({ onClick, className = "", children }) => (
  <button onClick={onClick} className={className} type="button">
    {children}
  </button>
);

const largeColumn = { width: "60%" };
const midColumn = { width: "30%" };
const smallColumn = { width: "10%" };
// export default App;

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
