const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const handleSearch = (e) => {
    e.preventDefault();
    helper.hideError();

    const query = e.target.querySelector('#domoSearchName').value;

    if (!query) {
        helper.handleError('Search query is required!');
        return false;
    }

    searchDomos(query);

    return false;
}

const searchDomos = async (query) => {
    const response = await fetch(`/searchDomos?name=${query}`);
    const data = await response.json();
    ReactDOM.render(
        <DomoResults query={query} domos={data.domos} />,
        document.getElementById('domos')
    );
}

const DomoSearchForm = (props) => {
    return (
        <form id="domoSearchForm"
            onSubmit={handleSearch}
            name="domoSeachForm"
            action="/search"
            method="GET"
            className="domoSearchForm"
        >
            <label htmlFor="domoSearchName">Name: </label>
            <input type="text" id="domoSearchName" name="name" placeholder="Domo Name" />
            <input type="submit" className="searchDomosSubmit" value="Search Domos" />
        </form>
    );
};

const DomoResults = (props) => {
    if (props.domos.length === 0) {
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Domos Found!</h3>
            </div>
        );
    }

    const domoNodes = props.domos.map(domo => {
        return (
            <div key={domo._id} className="domo">
                <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
                <h3 className="domoName">Name: {domo.name}</h3>
                <h3 className="domoColor">Color: {domo.color}</h3>
                <h3 className="domoAge">Age: {domo.age}</h3>
            </div>
        );
    });

    return (
        <div className="domoList">
            <h3>Results for: {props.query}</h3>
            {domoNodes}
        </div>
    );
}

const init = () => {
    ReactDOM.render(
        <DomoSearchForm />,
        document.getElementById('searchDomos')
    );

    ReactDOM.render(
        <DomoResults query="" domos={[]} />,
        document.getElementById('domos')
    );

    searchDomos();
}

window.onload = init;