const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const AllTimeStats = (props) => {
    const breakdown = props.allTime.breakdown.map((category) => {
        return <li 
        className='breakdownCategory' 
        data-guesses={category.guesses} 
        data-frequency={category.frequency}>
            {category.frequency}
    </li>
    });

    return (
        <div id='allTimeStats'>
            <h2>Won in _ guesses:</h2>
            <ol id='breakdown'>
                {breakdown}
            </ol>
            <h2>Win Rate</h2>
            <div id='winRate'>{Math.floor(props.allTime.wins * 100 / (props.allTime.losses + props.allTime.wins))}%</div>
        </div>
    );
};

const handleStats = (stats) => {
    ReactDOM.render(<AllTimeStats allTime={stats.allTime}></AllTimeStats>,
    document.getElementById('allTimeStatsWrapper'));
};

const init = () => {
    helper.sendGet('/getStats', {}, handleStats);
};

window.onload = init;