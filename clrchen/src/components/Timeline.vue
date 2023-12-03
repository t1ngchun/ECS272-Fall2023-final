<template>
    <div id='graphic'>
        <div id='sections'>
            <section class="step ">
            </section>
            <section class="step boarder">
                <div class="title">What happened the Columbine High School Event?</div>
                <span id="intro">
                    The Columbine High School massacre was a school shooting incident 
                    that occurred on April 20, 1999, at Columbine High School in Jefferson 
                    County, Colorado, USA. Two teenage students armed with firearms and explosives, 
                    entered the campus, resulting in the shooting deaths of 12 students and 1 teacher, 
                    with 24 others injured. Subsequently, both of them took their own lives. 
                    This event is regarded as the deadliest school shooting incident in American history. 
                    The term "Columbine" became synonymous  with school shootings.
                </span>
            </section>
            <section class="step boarder">
                <div class="title">The Columbine Shooting Event triggers a lots of school shooting events.</div>
                We divide the states in the US into four regions(<span class="low"> Low </span>,<span class="medium"> Moderate </span>,<span class="high"> High </span> 
                and<span class="very_high"> Very High </span>). According to the frequency of events occurence.
                The map is the overview of the total count of the shooting events in each region from 1999 to 2023.
                
            </section>
            <section class="step boarder">
                <div class="title">Heat Map</div>
                Break down the number of events into individual years, aiming to find out what is happening during the high occurrence year.
                the color represents the number of shooting events that happened in each group in each year. 
            </section>
            <section class="step boarder">
                <div class="title">Line Chart</div>
                Line Chart description
            </section>
            <section class="step boarder">
                <div class="title">Line Chart</div>
                Line Chart description
            </section>
            <section class="step boarder">
                <div class="title">Line Chart</div>
                Line Chart description
            </section>
            <section class="step boarder">
                <div class="title">Line Chart</div>
                Line Chart description
            </section>
            <section class="step boarder">
                <div class="title">Background Information of the Young Shooters</div>
                1. Where did they get the weapon?<br>
                2. Did they commit suicide after shooting?<br>
                3. Did they shoot others on purpose?
            </section>
        </div>
        <div id='vis'>
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
import { map } from "d3";

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
    occurenceLegend = occurenceCategories;
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
        // console.log(d.weapon_source)
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

  
let shootings = null;
let occurenceLegend = null;
let heatmaps = null;
let deceasedPieData = null;
let shootingPieData = null;
let weaponPieData = null;
d3.csv('../../data/school-shootings.csv')
  .then(function(loadedData) {
    const convertedData = loadedData.map(item => {
    // Convert 'year' property to a number, keep other properties unchanged
        return {
            ...item,
            year: !isNaN(item.year) ? +item.year : item.year
        };
    });
    // console.log(convertedData)
    shootings = getOcc(loadedData);
    console.log(occurenceLegend)
    heatmaps = getHeatMapData(convertedData)

    display(shootings)

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
/*
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */

function scrollVis(){
    // constants to define the size
    // and margins of the vis area.
    var width = 975;
    var height = 610;
    var margin = { top: 0, left: 20, bottom: 40, right: 10 };

    // Keep track of which visualization
    // we are on and which was the last
    // index activated. When user scrolls
    // quickly, we want to call all the
    // activate functions that they pass.
    var lastIndex = -1;
    var activeIndex = 0;

    // // Sizing for the grid visualization

    // main svg used for visualization
    var svg = null;

    // d3 selection that will be used
    // for displaying visualizations
    var g = null;

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
        selection.each(function () {
        
            svg = d3.select('#graphic #vis')
                .selectAll('svg')
                .data([null]) 
                .join('svg') 
                .attr("viewBox", [0, 0, width, height])
                .attr("width", width )
                .attr("height", height );

            svg.append('g');

            // This group element will be used to contain all other elements.
            g = svg.select('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            
            setupVis();
            setupSections();
        });
    };



    let map_text_g = null;
    let map_g = null;
    let map_legend = null;
    let map_legend_text1 = null;
    let map_legend_text2 = null;
    let heat_g = null;
    let deceased_pie_g = null;
    let shooting_pie_g = null;
    let weapon_pie_g = null;
    let rects = null;
    let legend = null;
    let xAxis_1999 = null;
    let xAxis_2003 = null;

    // for geomap
    const valuemap = new Map(shootings?.map(d => [d.name, d.occ_cat]));
    // const color_cat = d3.scaleOrdinal(d3.schemePastel1)
    const color_gradient = d3.scaleOrdinal(d3.schemeReds[4]).domain(["Low", "Moderate", "High", "Very High"])
    // for heatmap
    const color_event = d3.scaleSequential(d3.interpolateBuPu).domain([0, d3.max(heatmaps.values1DArray)])
    const color_occurence = d3.scaleOrdinal(d3.schemeReds[4]).domain(["Low", "Moderate", "High", "Very High"])
    /**
     * setupVis - creates initial elements for all
     * sections of the visualization.
     */
    var setupVis = function () {
        
        g.append('text')
        .attr('class', 'title event-title')
        .attr('x', width / 2)
        .attr('y', height / 3)
        .text('School Shootings')
        .attr('font-size', '50px')
        .attr('text-anchor', 'middle');
        g.append('text')
        .attr('class', 'sub-title event-title')
        .attr('x', width / 2)
        .attr('y', (height / 3) + (height / 5))
        .text('Influenced by Columbine Shooting Event in the US');
        g.selectAll('.openvis-title')
        .attr('opacity', 0);

        // draw the map
        if (us) {
            // let us_states = topojson.feature(us, us.objects.states).features
            let path = d3.geoPath()
            map_g = g.append("g")            
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("class", "county")
            .attr("d", path)
            .attr("stroke", "black")
            .attr("fill", "#E5E4E2")

            // Adding text labels
            map_text_g = g.append("g")
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
            .attr("x", (d) => path.centroid(d)[0])
            .attr("y", (d) => path.centroid(d)[1])
            .attr("text-anchor", "middle")
            .attr("dy", "0.4em")
            .style("font-size", "10px") 
            .style("fill", "black");

            // map_legend = g.append("g")
            let legendElementWidth = 30
            let legendHeight = 20      
            map_legend = g.append("g")
                        // .attr("transform", d => `translate(${width*0.7},0)` )
            map_legend
                        .attr("transform", d => `translate(${width*0.7},-${height*0.92})` )
                        .selectAll("rect")
                        .data(occurenceLegend)
                        .enter()
                        .append("rect")
                        .attr("x", (d, i) => legendElementWidth * i)
                        .attr("y", height - (2*legendHeight))
                        .attr("width", legendElementWidth)
                        .attr("height", legendHeight)
                        .style("fill", d => color_occurence(d.category));
            map_legend.append("g")
                        .attr("transform", d => `translate(0,+${height*0.01})` )
                        .selectAll("text")
                        .data(occurenceLegend)
                        .enter()
                        .append("text")
                        .text(d => parseInt(d.range[1]) )
                        .attr("x", (d, i) => legendElementWidth * (i+1)-5)
                        .attr("y", height - (legendHeight / 2)+5)
                        // .style("font-size", "1rem")
                        .style("fill", "#A4A4A4")
                        .style('font-weight', 'bold')
            map_legend.append("g")
                        .attr("transform", d => `translate(0,+${height*0.01})` )
                        .append("text")
                        .text("1")
                        .attr("x", -5)
                        .attr("y", height - (legendHeight / 2)+5)
                        // .style("font-size", "1rem")
                        .style("fill", "#A4A4A4")
                        .style('font-weight', 'bold')
        }
        if(heatmaps){
            heat_g = g.append("g")
            const rowHeight = 50;
            const RectsHeight = rowHeight * heatmaps.occurence.length + margin.top + margin.bottom;
            const x = d3.scaleLinear()
                .domain([d3.min(heatmaps.years), d3.max(heatmaps.years) + 1])
                .range([margin.left+15, width-margin.right-30])
            const y = d3.scaleBand()
                .domain(heatmaps.occurence)
                .rangeRound([height/3, height/3+RectsHeight - margin.bottom])
            
            const x_axis = heat_g.append("g")
                .call(g => g.append("g")
                    .attr("transform", `translate(0,${height/3})`)
                    .call(d3.axisTop(x).tickValues(heatmaps.years).ticks(null, "d"))
                    .call(g => g.select(".domain").remove()))
            const y_axis = heat_g.append("g")
                .attr("transform", `translate(${margin.left+15},0)`)
                .call(d3.axisLeft(y).tickSize(0))
                .call(g => g.select(".domain").remove());
            rects = heat_g.append("g")
                .selectAll("g")
                .data(heatmaps.twoDArray)
                .join("g")
                    .attr("transform", (d, i) => `translate(0,${y(heatmaps.occurence[i])})`)
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                    .attr("x", (d, i) => x(heatmaps.years[i]) + 1)
                    .attr("width", (d, i) => x(heatmaps.years[i] + 1) - x(heatmaps.years[i]) - 1)
                    .attr("height", y.bandwidth()-1)
                    .attr("fill", d => {return color_occurence(d.cat)})

                        
            xAxis_1999 = x_axis
            .append("g")
            // .style("opacity",0)
            .attr("transform", `translate(0,${height - margin.bottom*4})`)
            .call(d3.axisBottom(x)
                    .tickValues([heatmaps.year])
                    .tickFormat(x => x)
                    .tickSize(-RectsHeight-margin.bottom))
                    .style("color","red")
                .call(g => g.select(".tick text")
                    .attr("dy","1.5em")
                    .clone()
                    .attr("dy", "3em")
                    .style("font-weight", "bold")
                    .text("Columbine Event"))
                .call(g => g.select(".domain").remove())
            xAxis_2003 = x_axis
            .append("g")
            // .style("opacity",0)
            .attr("transform", `translate(0,${height - margin.bottom*4})`)
            .call(d3.axisBottom(x)
                    .tickValues([2003])
                    .tickFormat(x => x)
                    .tickSize(-RectsHeight-margin.bottom))
                    .style("color","red")
                .call(g => g.select(".tick text")
                    .attr("dy","1.5em")
                    .clone()
                    .attr("dy", "3em")
                    .style("font-weight", "bold")
                    .text("Columbine Event"))
                .call(g => g.select(".domain").remove())



            // legend

            const legendWidth = 300;
            const legendHeight = 15;
            const numColorSteps = 100; 

            legend = heat_g.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${margin.left + 5}, ${height / 5})`);

            const defs = legend.append("defs");
            const linearGradient = defs.append("linearGradient")
                .attr("id", "legendGradient")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");

            const domainValues = color_event.domain();
            const step = (domainValues[1] - domainValues[0]) / numColorSteps;
            for (let i = 0; i <= numColorSteps; i++) {
                linearGradient.append("stop")
                    .attr("offset", `${(i * 100) / numColorSteps}%`)
                    .attr("stop-color", color_event(domainValues[0] + step * i));
            }

            let legend_rect = legend.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", "url(#legendGradient)");

            const colorRange = Array.from({ length: 6 }, (_, i) => domainValues[0] + ((domainValues[1] - domainValues[0])/5 * i));

            const positionsInLegend = colorRange.map(value => {
                const mappedPosition = ((value - color_event.domain()[0]) / (color_event.domain()[1] - color_event.domain()[0])) * legendWidth;
                return mappedPosition;
            });


            const lengendValPos = colorRange.map((value, index) => {
                return {
                    value: parseInt(value.toFixed(1)),
                    position: positionsInLegend[index]
                };
            });

            legend.selectAll("line.quantile")
                .data(lengendValPos)
                .enter().append("line")
                .attr("class", "quantile")
                .attr("x1", d => (d.position))
                .attr("y1", -3)
                .attr("x2", d => (d.position))
                .attr("y2", legendHeight+3)
                .style("stroke", "#A4A4A4")
                .style("stroke-width", 1);

            legend.selectAll("text")
                .data(lengendValPos) // You can choose specific values to display on the legend
                .enter().append("text")
                .attr("x", d => (d.position-5))
                .attr("y", legendHeight + 20)
                .text(d => (d.value))
                .style("fill", "#A4A4A4")
                .style('font-weight', 'bold');
        }
        if (map_g) {
            map_g.attr('opacity', 0);
            map_text_g.attr('opacity', 0);
            map_legend.attr('opacity', 0);
            // map_legend_text1.attr('opacity', 0);
            // map_legend_text2.attr('opacity', 0);
            // d3.select("#intro").style("opacity", 0);
        }
        if (map_text_g) {
            map_text_g.attr('opacity', 0);
            legend.attr('opacity', 0);
            xAxis_1999.attr('opacity', 0);
            xAxis_2003.attr('opacity', 0);
        }
        if(heat_g){
            heat_g.attr('opacity', 0);
        }
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
        activateFunctions[1] = showMap;
        activateFunctions[2] = showMapGradient;
        activateFunctions[3] = showHeat;
        activateFunctions[4] = showPie;

        // updateFunctions are called while
        // in a particular section to update
        // the scroll progress in that section.
        // Most sections do not need to be updated
        // for all scrolling and so are set to
        // no-op functions.
        for (var i = 0; i < 9; i++) {
            updateFunctions[i] = function () {};
        }
        // updateFunctions[7] = updateCough;
    };

    /**
     * ACTIVATE FUNCTIONS
     */
     function showTitle() {
        g.selectAll('.event-title')
        .transition()
        .duration(0)
        .attr('opacity', 1);

        // d3.select("#intro").attr("opacity", 0);
        hideMap();
        hideMaptext();
        hideHeat();
    }
    /**
     * showIntro - show introduction
     *
     * hides: Topic title
     * shows: intro title
     *
     */
    function showIntro(){

    }
    /**
     * showMap - draw the map
     *
     * hides: Topic title
     * shows: map highlight CO
     *
     */    
    function showMap() {
        g.selectAll('.event-title')
        .transition()
        .duration(0)
        .attr('opacity', 0);

        if (map_g) {
            // d3.select("#intro")
            // .transition()
            // .duration(1000)
            // .style("opacity", 1);
            map_g
            .transition()
            .duration(600)
            .attr('opacity', 1.0)
            // .style("fill", "#fcfcfc")
            // .style("fill",(d) => { 
            //     if (valuemap.get(d.properties.name)) {
            //         return color_cat(valuemap.get(d.properties.name)) 
            //     } else {
            //         return "white"
            //     };
            // })
            .transition(1000)
            .style("fill",(d) => {
                if (d.properties.name == "Colorado") {
                    return ("#fb6a4a");
                } else {
                    return ("#E5E4E2");
                }
            })
        }

        if (map_text_g) {
            map_text_g
            .transition()
            .duration(600)
            .attr('opacity', 1.0)
        }

        hidePie();
        hideHeat();
    }

    /**
     * showMapGradient
     *
     * hides: intro, map, heatmap, pie
     * shows: map with gradient, states text
     *
     */
    function showMapGradient() {
        hideHeat();
        hidePie();
        if (map_g) {
            map_g
            .transition()
            .style("fill",(d) => {
                if(valuemap.get(d.properties.name)) {
                    return color_gradient(valuemap.get(d.properties.name)) 
                } else {
                    return "#E5E4E2"
                };
            })
            // .transition()
            // .style("fill",(d) => {
            //     if (d.properties.name == "Colorado") {
            //         return ("#773737");
            //     } else {
            //         if(valuemap.get(d.properties.name)){
            //             return color_gradient(valuemap.get(d.properties.name)) 
            //         } else {
            //             return "white"
            //         };
            //     }
            // })
        }
        if (map_text_g) {
            map_text_g
            .transition()
            .duration(0)
            .attr('opacity', 1.0);
        }
        if (map_legend) {
            map_legend
            .transition()
            .duration(0)
            .attr('opacity', 1.0);
        }        

    }

    /**
     * showHeat - heatmap transition from gray to sequential
     *
     * hides: intro, map, map_gradient, states text, pie
     * shows: heat map
     *
     */
    function showHeat() {
        hideMap();
        hideMaptext();
        hidePie();
        
        if (heat_g) {
            heat_g
            .transition()
            .duration(1000)
            .attr('opacity', 1.0);

            legend
            .transition()
            .duration(2000)
            .attr('opacity', 1.0);
                            
            rects.transition()
                .duration(2000)
                .attr('opacity', 1.0)
                .style("fill",(d,i)=> {return color_event(d.value)})

            xAxis_1999.transition()
                .duration(2000)
                .attr("opacity",0.6)
            xAxis_2003.transition()
                .duration(4000)
                .attr("opacity",0.6)
        }

        // g.selectAll('.square')
        // .transition()
        // .duration(600)
        // .delay(function (d) {
        //     return 5 * d.row;
        // })
        // .attr('opacity', 1.0)
        // .attr('fill', '#ddd');
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

        hideHeat();
        hideMaptext();

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

        hideHeat();
        hideMaptext();

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
        // hideAxis();
        hidePie();
        hideHeat();
        hideMaptext();

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
        // hideAxis();
        hidePie();
        hideHeat();
        hideMaptext();

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

    function showPie() {
        
        // hideMap();
        // hideMaptext();
        // hideHeat();
        
        // ensure the axis to histogram one
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

        // g.selectAll('.cough')
        // .transition()
        // .duration(0)
        // .attr('opacity', 0);

        // // named transition to ensure
        // // color change is not clobbered
        // g.selectAll('.hist')
        // .transition('color')
        // .duration(500)
        // .style('fill', '#008080');

        // g.selectAll('.hist')
        // .transition()
        // .duration(1200)
        // .attr('y', function (d) { return yHistScale(d.length); })
        // .attr('height', function (d) { return height - yHistScale(d.length); })
        // .style('opacity', 1.0);
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
        // hideAxis();
        hidePie();
        hideHeat();

        g.selectAll('.hist')
        .transition()
        .duration(600)
        .attr('y', function (d) { return yHistScale(d.length); })
        .attr('height', function (d) { return height - yHistScale(d.length); })
        .style('opacity', 1.0);

    }
    function hideMap() {
        if (map_g) {
            map_g
            .transition()
            .duration(0)
            .attr('opacity', 0);
        if(map_legend){
            map_legend
            .transition()
            .duration(0)
            .attr('opacity', 0);
        }
            
        }
    }

    function hideHeat() {
        if (heat_g) {
            heat_g
            .transition()
            .duration(0)
            .attr('opacity', 0);
            legend
            .transition()
            .duration(0)
            .attr('opacity', 0);
            rects
            .transition()
            .duration(0)
            .attr('opacity', 0);  
            xAxis_1999
            .transition()
            .duration(0)
            .attr('opacity', 0);
            xAxis_2003
            .transition()
            .duration(0)
            .attr('opacity', 0);          
        }

    }

    function hidePie() {
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

    function hideMaptext() {
        if (map_text_g) {
            map_text_g
            .transition()
            .duration(0)
            .attr('opacity', 0)
        }
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
        hidePie();
        
        hideHeat();
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

/*
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 */
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





</script>
<style scoped>

#graphic {
  width: 100%;
}


#sections {
  position: relative;
  display: inline-block;
  width: 270px;
  z-index: 90;
  padding-bottom: 300px; 
  /* add space for the last section */
}
#vis {
  display: inline-block;
  position: fixed;
  z-index: 1;
  /* margin-right: 10px; */
  /* flex:5; */
}
.step {
  margin-bottom: 300px;
  font-family: "TiemposTextWeb-Regular","Georgia";
  font-size: 16px;
  line-height: 23px;
  color: #767678;
  text-align: justify;
  padding:10px;
}
.boarder{
  border-style: groove;
}
#sections .title {
  font-family: Arial,Helvetica,"san-serif";
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 2px;
  color: #262626;
  line-height: 1.2em;

}

.low{
    color: black;
    background-color: #fee5d9;
    opacity:1.0;
  }
  .medium {
    color: black;
    background: #fcae91;
  }
  .high {
    color: black;
    background: #fb6a4a;
  }
  .very_high{
    color: black;
    background: #cb181d; 
  }
/* 
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

} */



</style>