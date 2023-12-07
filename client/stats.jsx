const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const AllTimeStats = (props) => {
    const breakdown = props.breakdown.map((category) => {
        return <div 
        className="breakdownCategory" 
        data-guesses={category.guesses} 
        data-frequency={category.frequency}>
    </div>
    });

    return (
        <div id="allTimeStats">
            {breakdown}
            <div id='winRate'>{Math.floor(props.wins * 100 / (props.losses + props.wins))}</div>
        </div>
    );
};