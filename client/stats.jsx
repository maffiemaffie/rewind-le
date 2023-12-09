const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const AllTimeStats = (props) => {
    const breakdown = props.allTime.breakdown.map((category) => {
        const frequencyPercentage = category.frequency * 100 / props.allTime.wins;
        
        return <li 
        className='breakdownCategory' 
        data-guesses={category.guesses} 
        data-frequency={category.frequency}>
            <svg 
                className='frequencyBar'
                width='100%' 
                height='100%' 
                xmlns='http://www.w3.org/2000/svg'>
                <rect 
                    x={0}
                    y={0}
                    width={`${frequencyPercentage}%`} 
                    height='100%'
                ></rect>
            </svg>
            <span className='frequencyValue'>{category.frequency}</span>
    </li>
    });

    const rate = Math.floor(props.allTime.wins * 100 / (props.allTime.losses + props.allTime.wins));

    const arcFromRate = (rate) => {
        const radius = 50;

        const startX = radius * 2;
        const startY = radius;
        
        const angle = Math.min(rate * 0.01 * 2 * Math.PI, 2 * Math.PI - 0.0001);
        const endX = radius + radius * Math.cos(angle);
        const endY = radius + radius * Math.sin(angle);

        const longArc = angle > Math.PI ? 1 : 0;

        return `
        M ${startX} ${startY}
        A ${radius} ${radius} 90 ${longArc} 1 ${endX} ${endY}
        `;
    }

    return (
        <div id='allTimeStats'>
            <h2 id='breakdownTitle'>Games won in _ guesses:</h2>
            <ol id='breakdown'>
                {breakdown}
            </ol>
            <h2 id='winrateTitle'>Win Rate</h2>
            <figure id='winRate'>
                <svg
                    width='100%' 
                    height='100%' 
                    viewBox='0 0 100 100'
                    xmlns='http://www.w3.org/2000/svg'>
                    <circle id='lossArc'
                        cx={50} cy={50} r={50}>
                    </circle>
                    <path id='winArc'
                        d={arcFromRate(rate)}>
                    </path>
                </svg>
                <figcaption style={{'--winrate': `${rate * 3.6}deg`}}>{rate}%</figcaption>
            </figure>
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