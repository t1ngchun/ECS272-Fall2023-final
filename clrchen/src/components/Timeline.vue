<template>
    <div class="container">
        <div id='graphic'>
            <div id='sections'>
            <section class="step">
                <div class="title">School Shootings Influenced by Columbine Shooting Event in the US</div>
            </section>
            <section class="step">
                <div class="title">The Columbine High School Event</div>
                - April 20, 1999, at Columbine High School in Jefferson County, Colorado, USA.<br>
                - 12 students and 1 teacher dead with 24 others injured<br>
                - The deadliest school shooting incident in American history.<br>
                - The term "Columbine" became synonymous with school shootings.
            </section>
            <section class="step">
                <div class="title">The Columbine Shooting Event triggers a lots of school shooting events.</div>
                The overview of the total count of the shooting events in each state from 1999 to 2023.
                The four different categories are based on the frequency of the shooting events occurrence.
            </section>
            <section class="step">
                <div class="title">Heat Map</div>
                Heat Map description
            </section>
            <section class="step">
                <div class="title">Line Chart</div>
                Line Chart description
            </section>
            <section class="step">
                <div class="title">Line Chart</div>
                Line Chart description
            </section>
            <section class="step">
                <div class="title">Line Chart</div>
                Line Chart description
            </section>
            <section class="step">
                <div class="title">Line Chart</div>
                Line Chart description
            </section>
            <section class="step">
                <div class="title">Background Information of the Young Shooters</div>
                1. Where did they get the weapon?<br>
                2. Did they commit suicide after shooting?<br>
                3. Did they shoot others on purpose?
            </section>
            </div>
            <div id='vis'>
            </div>
            <div id="extra-space">
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as d3 from "d3"
import * as vue from "vue"
import * as topojson from "topojson"
import { nest } from 'd3-collection';
import scroller from "../scroller"
import { states, provinces, occurence } from "./constants"
import { filterShootingType, filterShooterDeceased, filterWeaponSource, groupBy } from "./utils"

function convertRegion(input)  {
    var regions = states.concat(provinces);
    input = input.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    for (let region of regions) {
        if (region[0] == input) {
            return (region[1]);
        }
    }
}
// for geo map
function filterDataByState(data) {
  let states = groupBy(data, "state");
  let formattedData = [];
  Object.keys(states).forEach(d => {
    let num = states[d].length;
    let processedObj = {
      name: d,
      value: num,
    }
    formattedData.push(processedObj);
  });
  return formattedData;
}
function getOcc(data) {
    const dataByState = filterDataByState(data);
    const values = dataByState.map(item => item.value);
    const sortedValues = values.sort((a, b) => a - b);
    // Calculate percentiles and maximum
    const min = d3.min(sortedValues)
    const Q1 = d3.quantile(sortedValues, 0.25);
    const median = d3.median(sortedValues);
    const Q3 = d3.quantile(sortedValues, 0.75);
    const max = d3.max(sortedValues);
    // Define ranges based on these percentiles
    const rangeLow = [min, Q1];
    const rangeModerate = [Q1, median];
    const rangeHigh = [median, Q3];
    const rangeVeryHigh = [Q3, max + 1];
    
    const occurenceCategories = [
        { range: rangeLow, category: "Low" },
        { range: rangeModerate, category: "Moderate" },
        { range: rangeHigh, category: "High" },
        { range: rangeVeryHigh, category: "Very High" },
    ];

    let formattedData = [];
    Object.keys(dataByState).forEach(d => {
        let data = dataByState[d]
        const category = occurenceCategories.find((cat) => data.value >= cat.range[0] && data.value < cat.range[1]);
        const cat_occ = category ? category.category : "Unknown";
        let processedObj = {
        name: data.name,
        value: data.value,
        occ_cat: cat_occ
        }
        
        formattedData.push(processedObj);
    });

    return formattedData;
}
// for heat map
function getHeatMapData(data) {
    const years = [...new Set(data.map(item => item.year))]
    const nameToOccCatMap = getOcc(data).reduce((acc, item) => {
        acc[item.name] = item.occ_cat;
        return acc;
    }, {});
    
    const countByYearCategory = {};

    data.forEach((event) => {
        const { state, year } = event;
        const category = nameToOccCatMap[state];
        
        // Initialize count for the year if not present
        countByYearCategory[category] = countByYearCategory[category] || {};
        
        // Initialize count for the category if not present
        countByYearCategory[category][year] = (countByYearCategory[category][year] || 0) + 1;
    });
  
    years.forEach((year) => {
        occurence.forEach((category) => {
        countByYearCategory[category][year] = countByYearCategory[category][year] || 0;
        });
    });
    let rearrangedObject = {};
    occurence.forEach(key => {
        rearrangedObject[key] = countByYearCategory[key];
    });
    const result = Object.keys(rearrangedObject).flatMap(category => {
        const values = Object.values(rearrangedObject[category]);
        return values.map(value => ({ cat: category, value: value.toString() }));
    });
    const numRows = 4;
    const numColumns = 25;

    // Create a 2D array
    let twoDArray = [];

    // Iterate over rows
    for (let i = 0; i < numRows; i++) {
    // Extract a portion of the 1D array for each row
    let row = result.slice(i * numColumns, (i + 1) * numColumns);
    
    // Push the row to the 2D array
    twoDArray.push(row);
    }

    
    
    const values = occurence.map(category =>
        years.map(year => countByYearCategory[category][year] || 0)
    );
    const values1DArray = Object.values(countByYearCategory).flatMap(yearCounts =>
        Object.values(yearCounts)
    );

    console.log('xxx', values1DArray)
    
    return {
        twoDArray,
        values1DArray,
        occurence,
        years,
        year: 1999
    };
}
// for pie chart
function filteredPieChartData(data) {
    let formattedData = [];
    Object.keys(data).forEach(d => {
        let value = data[d];
        let processedObj = {
        year: value.year,
        state: value.state,
        killed: value.killed,
        injured: value.injured,
        casualties: value.casualties,
        age_shooter: value.age_shooter1,
        shooting_type: filterShootingType(value.shooting_type),
        shooter_deceased: filterShooterDeceased(value.shooter_deceased1, value.deceased_notes1),
        weapon_source: filterWeaponSource(value.weapon_source),
        }
        if (processedObj.year) {
        formattedData.push(processedObj);
        }
    });
    return formattedData;
}
function getDeceasedData(data) {
    let alive = 0
    let suicide = 0
    let police = 0
    let others = 0
    
    let filteredData = filteredPieChartData(data)
    filteredData.forEach(d => {
        if (d.shooter_deceased === 'alive') {
        alive += 1
        }
        if (d.shooter_deceased === 'suicide') {
        suicide += 1
        }
        if (d.shooter_deceased === 'police') {
        police += 1
        }
        if (d.shooter_deceased === 'others') {
        others += 1
        }
    });

    return [
        { name: 'alive', value: alive / 387},
        { name: 'killed by police', value: police / 387},
        { name: 'suicide', value: suicide / 387},
        { name: 'others or N/A', value: others / 387},
    ];
}
function getShootingData(data) {
    let targeted = 0
    let indiscriminate = 0
    let accidental = 0
    let others = 0
    
    let filteredData = filteredPieChartData(data)
    filteredData.forEach(d => {
        console.log(d.shooting_type)
        if (d.shooting_type === 'targeted') {
        targeted += 1
        }
        if (d.shooting_type === 'indiscriminate') {
        indiscriminate += 1
        }
        if (d.shooting_type === 'accidental') {
        accidental += 1
        }
        if (d.shooting_type === 'others') {
        others += 1
        }
    });

    return [
        { name: 'targeted', value: targeted / 387},
        { name: 'indiscriminate', value: indiscriminate / 387},
        { name: 'accidental', value: accidental / 387},
        { name: 'others or N/A', value: others / 387},
    ];
}
function getWeaponData (data) {
    let family = 0
    let issued = 0
    let friend = 0
    let stolen = 0
    let purchased = 0
    let others = 0
    
    let filteredData = filteredPieChartData(data)
    filteredData.forEach(d => {
        console.log(d.weapon_source)
        if (d.weapon_source === 'family') {
        family += 1
        }
        if (d.weapon_source === 'issued') {
        issued += 1
        }
        if (d.weapon_source === 'friend') {
        friend += 1
        }
        if (d.weapon_source === 'stolen') {
        stolen += 1
        }
        if (d.weapon_source === 'purchased') {
        purchased += 1
        }
        if (d.weapon_source === 'others') {
        others += 1
        }
    });

    return [
        { name: 'family', value: family / 387},
        { name: 'issued', value: issued / 387},
        { name: 'friend', value: friend / 387},
        { name: 'stolen', value: stolen / 387},
        { name: 'purchased', value: purchased / 387},
        { name: 'others or N/A', value: others / 387},
    ];
}

let data = null; // Initialize data variable
d3.tsv('../../data/words.tsv')
  .then(function(loadedData) {
    // Assign loaded data to the variable
    data = loadedData;
    // Call display function once the data is loaded
    display(data);
  })
  .catch(function(error) {
    // Handle error if data loading fails
    console.error('Error loading data:', error);
  });
  
let shootings = null;
let heatmaps = null;
let deceasedPieData = null;
let shootingPieData = null;
let weaponPieData = null;
d3.csv('../../data/school-shootings.csv')
  .then(function(loadedData) {
    // Assign loaded data to the variable
    shootings = getOcc(loadedData);
    display(shootings)
    // console.log('xxx', shootings)

    // heatmaps = getHeatMapData(loadedData)
    // display(heatmaps)

    deceasedPieData = getDeceasedData(loadedData)
    display(deceasedPieData)
    
    shootingPieData = getShootingData(loadedData)
    display(shootingPieData)

    weaponPieData = getWeaponData(loadedData)
    display(weaponPieData)
  })
  .catch(function(error) {
    // Handle error if data loading fails
    console.error('Error loading data:', error);
  });

let us = null;
d3.json('../../data/states-albers-10m.json')
  .then(function(loadedData) {
    // Assign loaded data to the variable
    us = loadedData;
    display(us)
  })
  .catch(function(error) {
    // Handle error if data loading fails
    console.error('Error loading data:', error);
  });

function scrollVis(){
    // constants to define the size
    // and margins of the vis area.
    var width = 993;
    var height = 700;
    var margin = { top: 0, left: 20, bottom: 40, right: 10 };

    // Keep track of which visualization
    // we are on and which was the last
    // index activated. When user scrolls
    // quickly, we want to call all the
    // activate functions that they pass.
    var lastIndex = -1;
    var activeIndex = 0;

    // Sizing for the grid visualization
    var squareSize = 6;
    var squarePad = 2;
    var numPerRow = width / (squareSize + squarePad);

    // main svg used for visualization
    var svg = null;

    // d3 selection that will be used
    // for displaying visualizations
    var g = null;

    // We will set the domain when the
    // data is processed.
    // @v4 using new scale names
    var xBarScale = d3.scaleLinear()
        .range([0, width]);

    // The bar chart display is horizontal
    // so we can use an ordinal scale
    // to get width and y locations.
    // @v4 using new scale type
    var yBarScale = d3.scaleBand()
        .paddingInner(0.08)
        .domain([0, 1, 2])
        .range([0, height - 50]);

    // Color is determined just by the index of the bars
    var barColors = { 0: '#008080', 1: '#399785', 2: '#5AAF8C' };

    // The histogram display shows the
    // first 30 minutes of data
    // so the range goes from 0 to 30
    // @v4 using new scale name
    var xHistScale = d3.scaleLinear()
        .domain([0, 30])
        .range([0, width - 20]);

    // @v4 using new scale name
    var yHistScale = d3.scaleLinear()
        .range([height, 0]);

    // The color translation uses this
    // scale to convert the progress
    // through the section into a
    // color value.
    // @v4 using new scale name
    var coughColorScale = d3.scaleLinear()
        .domain([0, 1.0])
        .range(['#008080', 'red']);

    // You could probably get fancy and
    // use just one axis, modifying the
    // scale, but I will use two separate
    // ones to keep things easy.
    // @v4 using new axis name
    var xAxisBar = d3.axisBottom()
        .scale(xBarScale);

    // @v4 using new axis name
    var xAxisHist = d3.axisBottom()
        .scale(xHistScale)
        .tickFormat(function (d) { return d + ' min'; });

    // When scrolling to a new section
    // the activation function for that
    // section is called.
    var activateFunctions = [];
    // If a section has an update function
    // then it is called while scrolling
    // through the section with the current
    // progress through the section.
    var updateFunctions = [];

    /**
     * chart
     *
     * @param selection - the current d3 selection(s)
     *  to draw the visualization in. For this
     *  example, we will be drawing it in #vis
     */
    var chart = function (selection) {
        selection.each(function (rawData) {
            // create svg and give it a width and height
            svg = d3.select(this).selectAll('svg').data([wordData]);
            var svgE = svg.enter().append('svg');
            // @v4 use merge to combine enter and existing selection
            svg = svg.merge(svgE);

            svg.attr('width', width + margin.left + margin.right);
            svg.attr('height', height + margin.top + margin.bottom);

            svg.append('g');


            // this group element will be used to contain all
            // other elements.
            g = svg.select('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            // perform some preprocessing on raw data
            var wordData = getWords([rawData]);
            // filter to just include filler words
            var fillerWords = getFillerWords(wordData);

            // get the counts of filler words for the
            // bar chart display
            var fillerCounts = groupByWord(fillerWords);
            // set the bar scale's domain
            var countMax = d3.max(fillerCounts, function (d) { return d.value;});
            xBarScale.domain([0, countMax]);

            // get aggregated histogram data

            var histData = getHistogram(fillerWords);
            // set histogram's domain
            var histMax = d3.max(histData, function (d) { return d.length; });
            yHistScale.domain([0, histMax]);

            setupVis(wordData, fillerCounts, histData);

            setupSections();
        });
    };


    /**
     * setupVis - creates initial elements for all
     * sections of the visualization.
     *
     * @param wordData - data object for each word.
     * @param fillerCounts - nested data that includes
     *  element for each filler word type.
     * @param histData - binned histogram data
     */
    let count_g = null;
    let map_g = null;
    let deceased_pie_g = null;
    let shooting_pie_g = null;
    let weapon_pie_g = null;
    
    // for geomap
    const valuemap = new Map(shootings?.map(d => [d.name, d.occ_cat]));
    const color_cat = d3.scaleOrdinal(d3.schemePastel1)
    const color_gradient = d3.scaleOrdinal(d3.schemeGreys[4]).domain(["Low", "Moderate", "High", "Very High"])
    // for heatmap

    var setupVis = function (wordData, fillerCounts, histData) {
        // axis
        g.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxisBar);
        g.select('.x.axis').style('opacity', 0);

        // draw the map
        if (us) {
            let path = d3.geoPath()
            map_g = svg.append("g")
            // g.append("g")
            // .attr('class', 'title openvis-title')
            // .attr("viewBox", [0, 0, width - margin.left - margin.right, height - margin.bottom - margin.top])
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom)
            .attr("viewBox", `0 0 ${width - margin.left - margin.right} ${height - margin.top - margin.bottom}`)
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("class", "county")
            .attr("d", path)
            .attr("stroke", "black")
            .attr("fill",(d) => { 
                if (valuemap.get(d.properties.name)) {
                    return color_cat(valuemap.get(d.properties.name)) 
                } else {
                    return "white"
                };
            })

            // Adding text labels
            count_g = svg.append("g")
            .selectAll("text")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("text")
            .text((d) => { 
                if (valuemap.get(d.properties.name)) {
                    return convertRegion(d.properties.name)
                } else {
                    return ""};
                }
            ) // Set the label to the state name
            .attr('class', 'title openvis-title')
            .attr("x", (d) => path.centroid(d)[0]) // X-coordinate of the label
            .attr("y", (d) => path.centroid(d)[1]) // Y-coordinate of the label
            .attr("text-anchor", "middle") // Center the text on the centroid
            .attr("dy", "0.4em") // Adjust vertical position
            .style("font-size", "10px") // Set the font size
            .style("fill", "black"); // Set the text color
        }

        // const x = d3.scaleLinear()
        // .domain([d3.min(heatmaps.years), d3.max(heatmaps.years) + 1])
        // .range([0, width])

        // const y = d3.scaleBand()
        // .domain(heatmaps.occurence)
        // .rangeRound([0, height])


        /*
        // count openvis title
        g.append('text')
        .attr('class', 'title openvis-title')
        .attr('x', width / 2)
        .attr('y', height / 3)
        .text('School Shootings')
        .attr('font-size', '50px')
        .attr('text-anchor', 'middle');
        g.append('text')
        .attr('class', 'sub-title openvis-title')
        .attr('x', width / 2)
        .attr('y', (height / 3) + (height / 5))
        .text('Influenced by Columbine Shooting Event in the US');
        */

        if (map_g) {
            map_g.attr('opacity', 0);
        }
        
        /*
        // count filler word count title
        g.append('text')
        .attr('class', 'title count-title highlight')
        .attr('x', width / 2)
        .attr('y', height / 3)
        .text('180');

        g.append('text')
        .attr('class', 'sub-title count-title')
        .attr('x', width / 2)
        .attr('y', (height / 3) + (height / 5))
        .text('Filler Words');
        */

        g.selectAll('.count-title')
        .attr('opacity', 0);

        // pie chart
        var deceasedColor = d3.scaleOrdinal(['#fff0f0', '#cbcbcb', '#ffaeb5', '#e1e1ff']);
        var shootingColor = d3.scaleOrdinal(['#d8e2dc', '#ffe5d9', '#ffcad4', '#f4acb7']);
        var weaponColor = d3.scaleOrdinal(['#ff99c8', '#fec8c3', '#fcf6bd', '#d0f4de', '#a9def9', '#c7ceea']);

        if (deceasedPieData) {
            var pie = d3.pie()
                .value((d) =>  d.value)
                .startAngle(0)
                .padAngle(.025)
                (deceasedPieData);

            var arc = d3.arc()
                .innerRadius(80)
                .outerRadius(160)
            
            deceased_pie_g = svg.append("g")
                .attr("class", "pie")
                .attr("transform", `translate(300, 200)`);
            
            var arcs = deceased_pie_g.selectAll("arc")
                .data(pie)
                .enter()
                .append("g");
            
            arcs.append("path")
                .attr("fill", (_, i) => deceasedColor(i))
                .attr("d", arc);

            // draw the label outside the dobut chart
            arcs.append("text")
                .attr("transform", d => {
                var c = arc.centroid(d);
                return "translate("  + c[0] * 1.8 + "," + c[1] * 1.5 + ")";
                })
                .attr("text-anchor", "middle")
                .text((d, i) => deceasedPieData[i].name)
                .style("font-size", 10)
                .attr("fill", "black");
        }
        if (shootingPieData) {
            var pie = d3.pie()
                .value((d) =>  d.value)
                .startAngle(0)
                .padAngle(.025)
                (shootingPieData);

            var arc = d3.arc()
                .innerRadius(80)
                .outerRadius(160)
            
            shooting_pie_g = svg.append("g")
                .attr("transform", `translate(750, 200)`);
            
            var arcs = shooting_pie_g.selectAll("arc")
                .data(pie)
                .enter()
                .append("g");
            
            arcs.append("path")
                .attr("fill", (_, i) => shootingColor(i))
                .attr("d", arc);

            // draw the label outside the dobut chart
            arcs.append("text")
                .attr("transform", d => {
                var c = arc.centroid(d);
                return "translate("  + c[0] * 1.8 + "," + c[1] * 1.5 + ")";
                })
                .attr("text-anchor", "middle")
                .text((d, i) => shootingPieData[i].name)
                .style("font-size", 10)
                .attr("fill", "black");
        }
        if (weaponPieData) {
            var pie = d3.pie()
                .value((d) =>  d.value)
                .startAngle(55)
                .padAngle(.025)
                (weaponPieData);

            var arc = d3.arc()
                .innerRadius(80)
                .outerRadius(160)
            
            weapon_pie_g = svg.append("g")
                .attr("transform", `translate(525, 500)`);
            
            var arcs = weapon_pie_g.selectAll("arc")
                .data(pie)
                .enter()
                .append("g");
            
            arcs.append("path")
                .attr("fill", (_, i) => weaponColor(i))
                .attr("d", arc);

            // draw the label outside the dobut chart
            arcs.append("text")
                .attr("transform", d => {
                var c = arc.centroid(d);
                return "translate("  + c[0] * 1.8 + "," + c[1] * 1.5 + ")";
                })
                .attr("text-anchor", "middle")
                .text((d, i) => weaponPieData[i].name)
                .style("font-size", 10)
                .attr("fill", "black");
        }

        if (deceased_pie_g) {
            deceased_pie_g.attr('opacity', 0);
        }
        if (shooting_pie_g) {
            shooting_pie_g.attr('opacity', 0);
        }
        if (weapon_pie_g) {
            weapon_pie_g.attr('opacity', 0);
        }

        // square grid
        // @v4 Using .merge here to ensure
        // new and old data have same attrs applied
        var squares = g.selectAll('.square').data(wordData, function (d) { return d.word; });
        var squaresE = squares.enter()
        .append('rect')
        .classed('square', true);
        squares = squares.merge(squaresE)
        .attr('width', squareSize)
        .attr('height', squareSize)
        .attr('fill', '#fff')
        .classed('fill-square', function (d) { return d.filler; })
        .attr('x', function (d) { return d.x;})
        .attr('y', function (d) { return d.y;})
        .attr('opacity', 0);

        // barchart
        // @v4 Using .merge here to ensure
        // new and old data have same attrs applied
        var bars = g.selectAll('.bar').data(fillerCounts);
        var barsE = bars.enter()
        .append('rect')
        .attr('class', 'bar');
        bars = bars.merge(barsE)
        .attr('x', 0)
        .attr('y', function (d, i) { return yBarScale(i);})
        .attr('fill', function (d, i) { return barColors[i]; })
        .attr('width', 0)
        .attr('height', yBarScale.bandwidth());

        var barText = g.selectAll('.bar-text').data(fillerCounts);
        barText.enter()
        .append('text')
        .attr('class', 'bar-text')
        .text(function (d) { return d.key + '…'; })
        .attr('x', 0)
        .attr('dx', 15)
        .attr('y', function (d, i) { return yBarScale(i);})
        .attr('dy', yBarScale.bandwidth() / 1.2)
        .style('font-size', '110px')
        .attr('fill', 'white')
        .attr('opacity', 0);

        // histogram
        // @v4 Using .merge here to ensure
        // new and old data have same attrs applied
        var hist = g.selectAll('.hist').data(histData);
        var histE = hist.enter().append('rect')
        .attr('class', 'hist');
        hist = hist.merge(histE).attr('x', function (d) { return xHistScale(d.x0); })
        .attr('y', height)
        .attr('height', 0)
        .attr('width', xHistScale(histData[0].x1) - xHistScale(histData[0].x0) - 1)
        .attr('fill', barColors[0])
        .attr('opacity', 0);

        // cough title
        g.append('text')
        .attr('class', 'sub-title cough cough-title')
        .attr('x', width / 2)
        .attr('y', 60)
        .text('cough')
        .attr('opacity', 0);

        // arrowhead from
        // http://logogin.blogspot.com/2013/02/d3js-arrowhead-markers.html
        svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('refY', 2)
        .attr('markerWidth', 6)
        .attr('markerHeight', 4)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 0,0 V 4 L6,2 Z');

        g.append('path')
        .attr('class', 'cough cough-arrow')
        .attr('marker-end', 'url(#arrowhead)')
        .attr('d', function () {
            var line = 'M ' + ((width / 2) - 10) + ' ' + 80;
            line += ' l 0 ' + 230;
            return line;
        })
        .attr('opacity', 0);
    };

    /**
     * setupSections - each section is activated
     * by a separate function. Here we associate
     * these functions to the sections based on
     * the section's index.
     *
     */
    var setupSections = function () {
        // activateFunctions are called each
        // time the active section changes
        activateFunctions[0] = showTitle;
        activateFunctions[1] = showFillerTitle;
        activateFunctions[2] = showGrid;
        activateFunctions[3] = highlightGrid;
        activateFunctions[4] = showBar;
        activateFunctions[5] = showHistPart;
        activateFunctions[6] = showHistAll;
        activateFunctions[7] = showCough;
        activateFunctions[8] = showHistAll;

        // updateFunctions are called while
        // in a particular section to update
        // the scroll progress in that section.
        // Most sections do not need to be updated
        // for all scrolling and so are set to
        // no-op functions.
        for (var i = 0; i < 9; i++) {
            updateFunctions[i] = function () {};
        }
        updateFunctions[7] = updateCough;
    };

    /**
     * ACTIVATE FUNCTIONS
     *
     * These will be called their
     * section is scrolled to.
     *
     * General pattern is to ensure
     * all content for the current section
     * is transitioned in, while hiding
     * the content for the previous section
     * as well as the next section (as the
     * user may be scrolling up or down).
     *
     */

    /**
     * showTitle - initial title
     *
     * hides: count title
     * (no previous step to hide)
     * shows: intro title
     *
     */
    function showTitle() {
        g.selectAll('.count-title')
        .transition()
        .duration(0)
        .attr('opacity', 0);

        // g.selectAll('.openvis-title')
        if (map_g) {
            map_g
            .transition()
            .duration(600)
            .attr('opacity', 1.0)
            .style("fill",(d) => { 
                if (valuemap.get(d.properties.name)) {
                    return color_cat(valuemap.get(d.properties.name)) 
                } else {
                    return "white"
                };
            })
        }

        if (count_g) {
            count_g
            .transition()
            .duration(600)
            .attr('opacity', 1.0)
        }

        if (deceased_pie_g) {
            deceased_pie_g
            .transition()
            .duration(0)
            .attr('opacity', 0);
        }
        if (shooting_pie_g) {
            shooting_pie_g
            .transition()
            .duration(0)
            .attr('opacity', 0);
        }
        if (weapon_pie_g) {
            weapon_pie_g
            .transition()
            .duration(0)
            .attr('opacity', 0);
        }
    }

    /**
     * showFillerTitle - filler counts
     *
     * hides: intro title
     * hides: square grid
     * shows: filler count title
     *
     */
    function showFillerTitle() {
        // g.selectAll('.openvis-title .county')
        if (map_g) {
            map_g
            .transition()
            .duration(1000)
            // .attr('opacity', 0);
            // .transition()
            .style("fill",(d) => {
                if(valuemap.get(d.properties.name)) {
                    return color_gradient(valuemap.get(d.properties.name)) 
                } else {
                    return "white"
                };
            })
            .transition()
            .style("fill",(d) => {
                if (d.properties.name == "Colorado") {
                    return ("#773737");
                } else {
                    if(valuemap.get(d.properties.name)){
                        return color_gradient(valuemap.get(d.properties.name)) 
                    } else {
                        return "white"
                    };
                }
            })
        }

        g.selectAll('.square')
        .transition()
        .duration(0)
        .attr('opacity', 0);

        g.selectAll('.count-title')
        .transition()
        .duration(600)
        .attr('opacity', 1.0);


        if (count_g) {
            count_g
            .transition()
            .duration(0)
            .attr('opacity', 1.0);
        }
    }

    /**
     * showGrid - square grid
     *
     * hides: filler count title
     * hides: filler highlight in grid
     * shows: square grid
     *
     */
    function showGrid() {
        if (count_g) {
            count_g
            .transition()
            .duration(600)
            .attr('opacity', 0)
        }

        // g.selectAll('.openvis-title .county')
        map_g
        .transition()
        .duration(0)
        .attr('opacity', 0); 
        

        g.selectAll('.count-title')
        .transition()
        .duration(0)
        .attr('opacity', 0);

        g.selectAll('.square')
        .transition()
        .duration(600)
        .delay(function (d) {
            return 5 * d.row;
        })
        .attr('opacity', 1.0)
        .attr('fill', '#ddd');
    }

    /**
     * highlightGrid - show fillers in grid
     *
     * hides: barchart, text and axis
     * shows: square grid and highlighted
     *  filler words. also ensures squares
     *  are moved back to their place in the grid
     */
    function highlightGrid() {
        hideAxis();
        g.selectAll('.bar .pie')
        .transition()
        .duration(600)
        .attr('width', 0);

        g.selectAll('.bar-text')
        .transition()
        .duration(0)
        .attr('opacity', 0);


        g.selectAll('.square')
        .transition()
        .duration(0)
        .attr('opacity', 1.0)
        .attr('fill', '#ddd');

        // use named transition to ensure
        // move happens even if other
        // transitions are interrupted.
        g.selectAll('.fill-square')
        .transition('move-fills')
        .duration(800)
        .attr('x', function (d) {
            return d.x;
        })
        .attr('y', function (d) {
            return d.y;
        });

        g.selectAll('.fill-square')
        .transition()
        .duration(800)
        .attr('opacity', 1.0)
        .attr('fill', function (d) { return d.filler ? '#008080' : '#ddd'; });
    }

    /**
     * showBar - barchart
     *
     * hides: square grid
     * hides: histogram
     * shows: barchart
     *
     */
    function showBar() {
        // ensure bar axis is set
        showAxis(xAxisBar);

        g.selectAll('.square')
        .transition()
        .duration(800)
        .attr('opacity', 0);

        g.selectAll('.fill-square')
        .transition()
        .duration(800)
        .attr('x', 0)
        .attr('y', function (d, i) {
            return yBarScale(i % 3) + yBarScale.bandwidth() / 2;
        })
        .transition()
        .duration(0)
        .attr('opacity', 0);

        g.selectAll('.hist')
        .transition()
        .duration(600)
        .attr('height', function () { return 0; })
        .attr('y', function () { return height; })
        .style('opacity', 0);

        g.selectAll('.bar .pie')
        .transition()
        .delay(function (d, i) { return 300 * (i + 1);})
        .duration(600)
        .attr('width', function (d) { return xBarScale(d.value); });

        g.selectAll('.bar-text')
        .transition()
        .duration(600)
        .delay(1200)
        .attr('opacity', 1);
    }

    /**
     * showHistPart - shows the first part
     *  of the histogram of filler words
     *
     * hides: barchart
     * hides: last half of histogram
     * shows: first half of histogram
     *
     */
    function showHistPart() {
        // switch the axis to histogram one
        showAxis(xAxisHist);

        g.selectAll('.bar-text')
        .transition()
        .duration(0)
        .attr('opacity', 0);

        g.selectAll('.bar .pie')
        .transition()
        .duration(600)
        .attr('width', 0);

        // here we only show a bar if
        // it is before the 15 minute mark
        g.selectAll('.hist')
        .transition()
        .duration(600)
        .attr('y', function (d) { return (d.x0 < 15) ? yHistScale(d.length) : height; })
        .attr('height', function (d) { return (d.x0 < 15) ? height - yHistScale(d.length) : 0; })
        .style('opacity', function (d) { return (d.x0 < 15) ? 1.0 : 1e-6; });
    }

    /**
     * showHistAll - show all histogram
     *
     * hides: cough title and color
     * (previous step is also part of the
     *  histogram, so we don't have to hide
     *  that)
     * shows: all histogram bars
     *
     */
    function showHistAll() {
        // ensure the axis to histogram one
        showAxis(xAxisHist);

        g.selectAll('.cough')
        .transition()
        .duration(0)
        .attr('opacity', 0);

        // named transition to ensure
        // color change is not clobbered
        g.selectAll('.hist')
        .transition('color')
        .duration(500)
        .style('fill', '#008080');

        g.selectAll('.hist')
        .transition()
        .duration(1200)
        .attr('y', function (d) { return yHistScale(d.length); })
        .attr('height', function (d) { return height - yHistScale(d.length); })
        .style('opacity', 1.0);
    }

    /**
     * showCough
     *
     * hides: nothing
     * (previous and next sections are histograms
     *  so we don't have to hide much here)
     * shows: histogram
     *
     */
    function showCough() {
        // ensure the axis to histogram one
        showAxis(xAxisHist);

        g.selectAll('.hist')
        .transition()
        .duration(600)
        .attr('y', function (d) { return yHistScale(d.length); })
        .attr('height', function (d) { return height - yHistScale(d.length); })
        .style('opacity', 1.0);

        if (deceased_pie_g) {
            deceased_pie_g
            .transition()
            .duration(600)
            .attr('opacity', 1.0);
        }
        if (shooting_pie_g) {
            shooting_pie_g
            .transition()
            .duration(600)
            .attr('opacity', 1.0);
        }
        if (weapon_pie_g) {
            weapon_pie_g
            .transition()
            .duration(600)
            .attr('opacity', 1.0);
        }
    }

    /**
     * showAxis - helper function to
     * display particular xAxis
     *
     * @param axis - the axis to show
     *  (xAxisHist or xAxisBar)
     */
    function showAxis(axis) {
        g.select('.x.axis')
        .call(axis)
        .transition().duration(500)
        .style('opacity', 1);
    }

    /**
     * hideAxis - helper function
     * to hide the axis
     *
     */
    function hideAxis() {
        g.select('.x.axis')
        .transition().duration(500)
        .style('opacity', 0);
    }

    /**
     * UPDATE FUNCTIONS
     *
     * These will be called within a section
     * as the user scrolls through it.
     *
     * We use an immediate transition to
     * update visual elements based on
     * how far the user has scrolled
     *
     */

    /**
     * updateCough - increase/decrease
     * cough text and color
     *
     * @param progress - 0.0 - 1.0 -
     *  how far user has scrolled in section
     */
    function updateCough(progress) {
        g.selectAll('.cough')
        .transition()
        .duration(0)
        .attr('opacity', progress);

        g.selectAll('.hist')
        .transition('cough')
        .duration(0)
        .style('fill', function (d) {
            return (d.x0 >= 14) ? coughColorScale(progress) : '#008080';
        });
    }

    /**
     * DATA FUNCTIONS
     *
     * Used to coerce the data into the
     * formats we need to visualize
     *
     */

    /**
     * getWords - maps raw data to
     * array of data objects. There is
     * one data object for each word in the speach
     * data.
     *
     * This function converts some attributes into
     * numbers and adds attributes used in the visualization
     *
     * @param rawData - data read in from file
     */
    function getWords(rawData) {
        return rawData.map(function (d, i) {
        // is this word a filler word?
        d.filler = (d.filler === '1') ? true : false;
        // time in seconds word was spoken
        d.time = +d.time;
        // time in minutes word was spoken
        d.min = Math.floor(d.time / 60);

        // positioning for square visual
        // stored here to make it easier
        // to keep track of.
        d.col = i % numPerRow;
        d.x = d.col * (squareSize + squarePad);
        d.row = Math.floor(i / numPerRow);
        d.y = d.row * (squareSize + squarePad);
        return d;
        });
    }

    /**
     * getFillerWords - returns array of
     * only filler words
     *
     * @param data - word data from getWords
     */
    function getFillerWords(data) {
        return data.filter(function (d) {return d.filler; });
    }

    /**
     * getHistogram - use d3's histogram layout
     * to generate histogram bins for our word data
     *
     * @param data - word data. we use filler words
     *  from getFillerWords
     */
    function getHistogram(data) {
        // only get words from the first 30 minutes
        var thirtyMins = data.filter(function (d) { return d.min < 30; });
        // bin data into 2 minutes chuncks
        // from 0 - 31 minutes
        // @v4 The d3.histogram() produces a significantly different
        // data structure then the old d3.layout.histogram().
        // Take a look at this block:
        // https://bl.ocks.org/mbostock/3048450
        // to inform how you use it. Its different!
        return d3.histogram()
        .thresholds(xHistScale.ticks(10))
        .value(function (d) { return d.min; })(thirtyMins);
    }
    
    /**
    * groupByWord - group words together
    * using nest. Used to get counts for
    * barcharts.
    *
    * @param words
    */
    function groupByWord(words) {
        return nest()
        .key(function (d) { return d.word; })
        .rollup(function (v) { return v.length; })
        .entries(words)
        .sort(function (a, b) {return b.value - a.value;});
    }

    /**
    * activate -
    *
    * @param index - index of the activated section
    */
    chart.activate = function (index) {
        activeIndex = index;
        var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
        var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
        scrolledSections.forEach(function (i) {
        activateFunctions[i]();
        });
        lastIndex = activeIndex;
    };

    /**
    * update
    *
    * @param index
    * @param progress
    */
    chart.update = function (index, progress) {
        updateFunctions[index](progress);
    };

    // return chart function
    return chart;
}
function display(data) {
    // create a new plot and
    // display it
    // let data = this.data;
    var plot = scrollVis();
    d3.select('#vis')
        .datum(data)
        .call(plot);

    // setup scroll functionality
    let myscroll = scroller.scroller()
        .container(d3.select('#graphic'));

    // pass in .step selection as the steps
    myscroll(d3.selectAll('.step'));

    // setup event handling
    myscroll.on('active', function (index) {
        // highlight current step text
        d3.selectAll('.step')
        .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

        // activate current section
        plot.activate(index);
    });

    myscroll.on('progress', function (index, progress) {
        plot.update(index, progress);
    });
}

/*
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */

/*
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 */



</script>
<style scoped>
/* .container {
  width: 890px;
} */

#graphic {
  padding-top: 60px;
}


#sections {
  position: relative;
  display: inline-block;
  width: 250px;
  top: 0px;
  z-index: 90;
  padding-bottom: 200px;
}

.step {
  margin-bottom: 200px;
  font-family: "TiemposTextWeb-Regular","Georgia";
  font-size: 16px;
  line-height: 23px;
  color: #767678;
}

#sections .title {
  font-family: Arial,Helvetica,"san-serif";
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 2px;
  color: #262626;
  line-height: 1.2em;
}

#extra-space {
  height: 300px;
}

#vis {
  display: inline-block;
  position: fixed;
  top: 60px;
  z-index: 1;
  margin-left: 0;
  /* height: 600px; */
  width: 100%;
  /* background-color: red; */
}

#vis title {
  font-size:120px;
  text-anchor: middle;
}

#vis .sub-title {
  font-size:80px;
  text-anchor: middle;
}

.axis path,
.axis line {
  fill: none;
  stroke: #666;
  shape-rendering: crispEdges;
}

.highlight {
  fill: #008080;
  font-weight: bold;
}

.cough-arrow {
  stroke: #000;
  stroke-width: 4px;

}
</style>