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
            </section>
            <section class="step boarder">
                <div class="title">We focus on the states which has high frequency of events occurence (event number > 11).</div>
                From 1999 to 2023 we found out that California (40), Texas (25), Florida (24), and North Carolina (21) have the most number of school shooting events.
            </section>
            <section class="step boarder">
                <div class="title">Screenshot</div>
                Screenshot
            </section>
            <section class="step boarder">
                <div class="title">Heat Map</div>
                Heat Map description
            </section>
            <section class="step boarder">
                <div class="title">Heat Map Takeaway</div>
                Heat Map Takeaway
            </section>
            <section class="step boarder">
                <div class="title">Line Chart</div>
                The y-axis represents the trend of the age of young shooters, and the x-axis represents years from 1999 to 2023.
                <div class="title">We found that the age of young shooters is decreasing.</div>
                2023 even has the lowest age that the young shooter is only 7 year-old.
            </section>
            <section class="step boarder">
                <div class="title">Background Information of the Young Shooters</div>
                1. Where did they get the weapon?<br>
                2. Did they commit suicide after shooting?<br>
                3. Did they shoot others on purpose?
            </section>
            <section class="step boarder">
                <div class="title">Takeaway</div>
                Takeaway
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
import { hideMap, hideMaptext, hideMapcount, hideDots, hideHeatState, hideLine, hidePie} from "./hidecomponent"
import { filter, line, map, pie, sort } from "d3";
import { h } from "vue";


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
function getHeatMapData_state(data) {
    const years = [...new Set(data.map(item => item.year))]
    const states = [...new Set(data.map(item => item.state))]
    const nameToOccCatMap = getOcc(data).reduce((acc, item) => {
        acc[item.name] = item.occ_cat;
        return acc;
    }, {});
    const sortedStatesByOccurrence = states.map(state => ({
        state,
        category: nameToOccCatMap[state] || "Unknown" 
    }));

    sortedStatesByOccurrence.sort((a, b) => {
        return (
            occurence.indexOf(a.category) - occurence.indexOf(b.category)
        );
    });
    const updatedStates = sortedStatesByOccurrence.map(item => item.state);
    const highStates = sortedStatesByOccurrence.filter(item => item.category === "Very High").map(item => item.state);
    const countByYearCategory = {};

    data.forEach((event) => {
        const { state, year } = event;
        countByYearCategory[state] = countByYearCategory[state] || {};
        countByYearCategory[state][year] = (countByYearCategory[state][year] || 0) + 1;
    });
    years.forEach((year) => {
        updatedStates.forEach((state) => {
            countByYearCategory[state][year] = countByYearCategory[state][year] || 0;
        });
    });

    let rearrangedObject = {};
    updatedStates.forEach(key => {
        rearrangedObject[key] = countByYearCategory[key];
    });
    const result = Object.keys(rearrangedObject).flatMap(state => {
        const values = Object.values(rearrangedObject[state]);
        return values.map(value => ({ state: state, value: value.toString() }));
    });

    const numRows = updatedStates.length;
    const numColumns = years.length;

    let twoDArray = [];

    for (let i = 0; i < numRows; i++) {
        let row = result.slice(i * numColumns, (i + 1) * numColumns);
    twoDArray.push(row);
    }
    const values1DArray = Object.values(countByYearCategory).flatMap(yearCounts =>
        Object.values(yearCounts)
    );
    
    return {
        twoDArray,
        values1DArray,
        sortedStatesByOccurrence,
        updatedStates,
        highStates,
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
            age_shooter: parseInt(value.age_shooter1),
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
// for line chart
function getShooterAgeData(data) {
    let filteredData = filteredPieChartData(data)
    let acc = 0;
    let len = filteredData.length;
    filteredData.map((data) => {
        if (data.age_shooter) {
            acc += data.age_shooter;
        }
    })
    let avg = Math.round(acc / len);
    let yearsData = groupBy(filteredData, 'year')
    const averageAges = Object.entries(yearsData).map(([year, data]) => {
        const totalAge = data.reduce((sum, obj) => obj.age_shooter ? sum + obj.age_shooter : sum, 0);
        const averageAge = totalAge / data.length || 0; // To avoid division by zero
        return { year: parseInt(year), age: Math.round(averageAge), average: avg};
    });
    return averageAges;
}
// for pie chart
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

let convertedData = null;
let shootings = null;
let occurenceLegend = null;
let heatmaps_state = null;
let deceasedPieData = null;
let shootingPieData = null;
let weaponPieData = null;
let lineChartData = null;
let ageLine = null;
let avgLine = null;

d3.csv('../../data/school-shootings.csv')
  .then(function(loadedData) {
    convertedData = loadedData.map(item => {
        return {
            ...item,
            long: +item.long,
            lat: +item.lat,
            year: !isNaN(item.year) ? +item.year : item.year
        };
    });
    shootings = getOcc(loadedData);

    heatmaps_state = getHeatMapData_state(convertedData)
    display(convertedData)

    display(shootings)
    display(heatmaps_state)

    lineChartData = getShooterAgeData(loadedData)
    display(lineChartData)

    deceasedPieData = getDeceasedData(loadedData)
    display(deceasedPieData)
    
    shootingPieData = getShootingData(loadedData)
    display(shootingPieData)

    weaponPieData = getWeaponData(loadedData)
    display(weaponPieData)
  })
  .catch(function(error) {
    console.error('Error loading data:', error);
  });

let us = null;
d3.json('../../data/states-albers-10m.json')
  .then(function(loadedData) {
    us = loadedData;
    display(us)
  })
  .catch(function(error) {
    console.error('Error loading data:', error);
  });
let gun = null;
d3.xml('../../data/gun-svgrepo-com.svg').then(svgData => {
    gun = svgData
});


function scrollVis(){

    var width = 975;
    var height = 610;
    var margin = { top: 0, left: 20, bottom: 40, right: 10 };

    var lastIndex = -1;
    var activeIndex = 0;


    var svg = null;
    var g = null;
    var activateFunctions = [];
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


    let map_count_g = null;
    let map_text_g = null;
    let map_g = null;
    let circle_g = null;
    let heat_state_g = null;
    let x = null;
    let y = null;
    let y_axis = null;
    let x_axis = null;
    let deceased_pie_g = null;
    let shooting_pie_g = null;
    let weapon_pie_g = null;
    let heat_rects = null;
    let legend = null;
    let xAxis_1999 = null;
    let xAxis_2003 = null;
    let line_g = null;

    // for geomap
    const valuemap = new Map(shootings?.map(d => [d.name, d.occ_cat]));
    const countmap = new Map(shootings?.map(d => [d.name, d.value]));
    const color_gradient = d3.scaleOrdinal(d3.schemeReds[4]).domain(["Low", "Moderate", "High", "Very High"])
    const color_state = d3.scaleSequential(d3.interpolateBuPu).domain([0, d3.max(heatmaps_state.values1DArray)])
    
    //line chart
    function transition(path) {
        var totalLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .attr("stroke-dashoffset", 0);
    }

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
            let path = d3.geoPath()
            map_g = g.append("g")            
            .selectAll("path")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("class", "county")
            .attr("d", path)
            .attr("stroke", "black")
            .attr("fill", "#E5E4E2")
            let projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
            // Adding circles
            circle_g = g.append("g")            
            .selectAll("circle")
            .data(convertedData.filter(d=>d.long!=0 && d.lat!=0))
            .enter()
            .append("circle")        
            .attr("cx", d => {
                return projection([d.long,d.lat])[0];
            })
            .attr("cy", d => {
                return projection([d.long,d.lat])[1];
            })
            .attr("r", 3)
            .attr("fill", "#fb6a4a"); 
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
            ) 
            .attr("x", (d) => path.centroid(d)[0])
            .attr("y", (d) => path.centroid(d)[1])
            .attr("text-anchor", "middle")
            .attr("dy", "0.4em")
            .style("font-size", "10px") 
            .style("fill", "black");
            // Adding text labels
            map_count_g = g.append("g")
            .selectAll("text")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("text")
            .text((d) => { 
                if (countmap.get(d.properties.name)&& valuemap.get(d.properties.name)== "Very High") {
                    // console.log(countmap.get(d.properties.name))
                    return countmap.get(d.properties.name)
                } else {
                    return ""};
                }
            ) // Set the label to the state name
            .attr("x", (d) => path.centroid(d)[0]+20)
            .attr("y", (d) => path.centroid(d)[1]+15)
            .attr("text-anchor", "middle")
            .attr("dy", "0.4em")
            .style("font-size", "15px") 
            .style("font-weight", "bold")
            .style("fill", "white");
        }

        if(heatmaps_state){
            heat_state_g = g.append("g")
            const rowHeight = 12;
            const RectsHeight = rowHeight * heatmaps_state.updatedStates.length + margin.top + margin.bottom;
            x = d3.scaleLinear()
                .domain([d3.min(heatmaps_state.years), d3.max(heatmaps_state.years) + 1])
                .range([margin.left+width/6, (width-margin.right-30)/1.1])
            y = d3.scaleBand()
                .domain(heatmaps_state.updatedStates)
                .rangeRound([height/12+20, height/12+20+RectsHeight - margin.bottom])
 

            x_axis = heat_state_g.append("g")
                .call(g => g.append("g")
                    .attr("transform", `translate(0,${height/12+20})`)
                    .call(d3.axisTop(x).tickValues(heatmaps_state.years).ticks(null, "d"))
                    .call(g => g.select(".domain").remove()))
            y_axis = heat_state_g.append("g")
                .attr("transform", `translate(${margin.left+width/6},0)`)
                .call(d3.axisLeft(y).tickSize(0))

            heat_rects = heat_state_g.append("g")
                .selectAll("g")
                .data(heatmaps_state.twoDArray)
                .enter()
                .append("g")
                .attr("id", "long_rects")
                .attr("transform", (d, i) => `translate(0,${y(heatmaps_state.updatedStates[i])})`)
                .selectAll("rect")
                .data(d => d)
                .enter()
                .append("rect")
                .attr("id", "small_rects")
                    .attr("x", (d, i) => x(heatmaps_state.years[i]) + 1)
                    .attr("width", (d, i) => x(heatmaps_state.years[i] + 1) - x(heatmaps_state.years[i]) - 1)
                    .attr("height", y.bandwidth()-1)
                    .attr("fill", d => {return color_state(d.value)})
        
            // legend
            const legendWidth = 200;
            const legendHeight = 15;
            const numColorSteps = 100; 

            legend = heat_state_g.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${margin.left + 5},${height/1.5}) rotate(-90)`);


            const defs = legend.append("defs");
            const linearGradient = defs.append("linearGradient")
                .attr("id", "legendGradient")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");

            const domainValues = color_state.domain();
            const step = (domainValues[1] - domainValues[0]) / numColorSteps;
            for (let i = 0; i <= numColorSteps; i++) {
                linearGradient.append("stop")
                    .attr("offset", `${(i * 100) / numColorSteps}%`)
                    .attr("stop-color", color_state(domainValues[0] + step * i));
            }

            legend.append("rect")
                .attr("x",  -legendWidth)
                .attr("y",-15)
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .attr("transform", `rotate(-180) `)
                .style("fill", "url(#legendGradient)");

            const colorRange = Array.from({ length: 6 }, (_, i) => domainValues[0] + ((domainValues[1] - domainValues[0])/5 * i));

            const positionsInLegend = colorRange.map(value => {
                const mappedPosition = ((value - color_state.domain()[0]) / (color_state.domain()[1] - color_state.domain()[0])) * legendWidth;
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
                .data(lengendValPos)
                .enter().append("text")
                .attr("y", d => (d.position-5))
                .attr("x", legendHeight + 20)
                .text(d => (d.value))
                .attr("transform",`translate(${legendWidth-10},0) rotate(90)`)
                .style("fill", "#A4A4A4")
                .style('font-weight', 'bold');



            // xAxis_1999 = x_axis
            // .append("g")
            // // .style("opacity",0)
            // .attr("transform", `translate(0,${height - margin.bottom*4})`)
            // .call(d3.axisBottom(x)
            //         .tickValues([heatmaps.year])
            //         .tickFormat(x => x)
            //         .tickSize(-RectsHeight-margin.bottom))
            //         .style("color","red")
            //     .call(g => g.select(".tick text")
            //         .attr("dy","1.5em")
            //         .clone()
            //         .attr("dy", "3em")
            //         .style("font-weight", "bold")
            //         .text("Columbine Event"))
            //     .call(g => g.select(".domain").remove())
            // xAxis_2003 = x_axis
            // .append("g")
            // // .style("opacity",0)
            // .attr("transform", `translate(0,${height - margin.bottom*4})`)
            // .call(d3.axisBottom(x)
            //         .tickValues([2003])
            //         .tickFormat(x => x)
            //         .tickSize(-RectsHeight-margin.bottom))
            //         .style("color","red")
            //     .call(g => g.select(".tick text")
            //         .attr("dy","1.5em")
            //         .clone()
            //         .attr("dy", "3em")
            //         .style("font-weight", "bold")
            //         .text("Columbine Event"))
            //     .call(g => g.select(".domain").remove())
        }

        if (map_g) {
            map_g.attr('opacity', 0);
            map_text_g.attr('opacity', 0);
            circle_g.attr('opacity', 0);
        }
        if(map_count_g){
            map_count_g.attr('opacity', 0);
        }
        if (map_text_g) {
            map_text_g.attr('opacity', 0);
        }

        if(heat_state_g){
            heat_state_g.attr('opacity', 0);
            legend.attr('opacity', 0);

        }

        // line chart
        
        if (lineChartData) {
            const x = d3.scaleLinear()
                .domain(d3.extent(lineChartData, d => d.year))
                .range([margin.left+50, width - margin.right - 50]);
            
            const y = d3.scaleLinear()
                .domain([0, d3.max(lineChartData, d => d.age) + 1])
                .range([height - margin.top, margin.bottom + 10]);
            
            // Define the line function
            const line = d3.line()
                .x(d => x(d.year))
                .y(d => y(d.age));

            // Define the line function
            const avgAgeLine = d3.line()
                .x(d => x(d.year))
                .y(d => y(d.average));

            line_g = g.append("g")
            
            // Draw the line
            ageLine = line_g.append("path")
                .datum(lineChartData)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 3)
                .attr("d", line)
                .attr("transform",  `translate(0, -${margin.bottom})`)
                .attr('class', 'age-line')


            // const yExtents = d3.extent(lineChartData, d => d.age);
            // line_g.selectAll(".dot")
            //     .data(lineChartData)
            //     .enter().append("circle")
            //     .attr("class", "dot")
            //     .attr("cx", d => x(d.year))
            //     .attr("cy", d => y(d.age))
            //     .attr("transform",  `translate(0, -${margin.bottom})`)
            //     .attr('r', function (d) { 
            //         return d.age == yExtents[0] || d.age == yExtents[1] ? 5 : 0;
            //     })
            //     .attr("fill", "red");

            // Draw the average line
            avgLine = line_g.append("path")
                .datum(lineChartData)
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-width", 1)
                .attr("d", avgAgeLine)
                .attr("transform",  `translate(0, -${margin.bottom})`)
                .attr('class', 'average-line')
            
            // Draw the average text
            line_g.append("g")
                .attr("transform",  `translate(${width - 90}, ${height / 2 - 70})`)
                .append("text")
                .style("font-size", 12)
                .style("fill", "green")
                .text("Average: 14")
                .style("text-anchor", "middle")

            // Draw the triangle mark
            var sym = d3.symbol().type(d3.symbolTriangle).size(100); 
            line_g.append("path") 
                .attr("d", sym) 
                .attr("fill", "red") 
                .attr("transform", `translate(${width - 60}, ${height / 2 + 85}) rotate(180)`);

            // Draw the lowest age text
            line_g.append("g")
                .attr("transform",  `translate(${width - 65}, ${height / 2 + 70})`)
                .append("text")
                .style("font-size", 15)
                .style("fill", "red")
                .style("font-weight", "bold")
                .text("Age: 7")
                .style("text-anchor", "middle")

            line_g.append("path") 
                .attr("d", sym) 
                .attr("fill", "red") 
                .attr("transform", `translate(${width / 2.5 + 15}, ${height / 12 - 20}) rotate(-90)`);

            // Draw the highest age text
            line_g.append("g")
                .attr("transform",  `translate(${width / 2.5 + 55}, ${height / 12 - 15})`)
                .append("text")
                .style("font-size", 15)
                .style("fill", "red")
                .style("font-weight", "bold")
                .text("Age: 23")
                .style("text-anchor", "middle")


            // avgAgeLine = line_g.append("path")
            //     .datum(lineChartData)
            //     .attr("fill", "none")
            //     .attr("stroke", "steelblue")
            //     .attr("stroke-width", 3)
            //     .attr("d", line)
            //     .attr('class', 'age-line')


            // Add x-axis
            line_g.append("g")
                .attr("transform", `translate(0, ${height - margin.bottom})`)
                .call(d3.axisBottom(x).ticks(28).tickFormat(d => d.toString()))
                .selectAll("text")
                .style("text-anchor", "end")
                .style("font-size", 10)
                .attr("dx", "-.8em")
                .attr("dy", "1em")
                .attr("transform", `rotate(-35)`);
            
            // Add y-axis
            line_g.append("g")
                .attr("transform",  `translate(${margin.left+50}, ${- margin.bottom})`)
                .call(d3.axisLeft(y))
                .selectAll("text")
                .style("text-anchor", "end")
                .style("font-size", 10)
            
            // Add labels
            line_g.append("text")
                .attr("transform", `rotate(-90)`)
                .attr("x", -200)
                .attr("y", margin.top + 25)
                .style("font-size", 15)
                .text("Age");

            // Words
            line_g.append("g")
                .attr("transform",  `translate(${margin.left + 100}, ${height - 180})`)
                .append("text")
                .style("font-size", 14)
                .style("fill", "grey")
                .text("There could be various factors contributing to a decrease in the age of young shooters involved in school")
            // Words
            line_g.append("g")
                .attr("transform",  `translate(${margin.left + 100}, ${height - 160})`)
                .append("text")
                .style("font-size", 14)
                .style("fill", "grey")
                .text("shooting events over time. The factors may involve Access to Firearms, Mental Health, Copycat Behavior.")
            // Words
            line_g.append("g")
                .attr("transform",  `translate(${margin.left + 100}, ${height - 140})`)
                .append("text")
                .style("font-size", 14)
                .style("fill", "grey")
                .text("Accessibility to firearms among younger individuals might have increased.")
            
            // Words
            line_g.append("g")
                .attr("transform",  `translate(${margin.left + 100}, ${height - 120})`)
                .append("text")
                .style("font-size", 14)
                .style("fill", "grey")
                .text("There might be a rise in mental health issues or social challenges affecting younger generations.")

            // Words
            line_g.append("g")
                .attr("transform",  `translate(${margin.left + 100}, ${height - 100})`)
                .append("text")
                .style("font-size", 14)
                .style("fill", "grey")
                .text("Media coverage and publicized incidents might influence copycat behavior among younger individuals.")


                


        }

        if (line_g) {
            line_g.attr('opacity', 0)
        }
        // pie chart
        var deceasedColor = d3.scaleOrdinal(['#d8e2dc', '#d8e2dc', '#ffcad4', '#cbcbcb']);
        var shootingColor = d3.scaleOrdinal(['#ffcad4', '#d8e2dc', '#d8e2dc', '#cbcbcb']);
        var weaponColor = d3.scaleOrdinal(['#ffcad4', '#d8e2dc', '#d8e2dc', '#d8e2dc', '#d8e2dc', '#cbcbcb']);

        if (deceasedPieData) {
            var pie = d3.pie()
                .value((d) =>  d.value)
                .startAngle(0)
                .padAngle(.025)
                (deceasedPieData);

            var arc = d3.arc()
                .innerRadius(60)
                .outerRadius(120)
            
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
                return "translate("  + (c[0] * 1.8-10) + "," + (c[1] * 1.9+30) + ")";
                })
                .attr("text-anchor", "middle")
                .text((d, i) => deceasedPieData[i].name)
                .style("font-size", 10)
                .attr("fill", "black");

            arcs.append("text")
                .attr("transform", d => {
                var c = arc.centroid(d);
                return "translate("  + c[0] + "," + c[1] + ")";
                })
                .attr("text-anchor", "middle")
                .text(function(d, i) {
                    if(Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) > 1){
                        return `${Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 100)}%`
                    }
                })
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
                .innerRadius(60)
                .outerRadius(120)
            
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
                return "translate("  + c[0] * 1.8 + "," + (c[1] * 1.5-10) + ")";
                })
                .attr("text-anchor", "middle")
                .text((d, i) => shootingPieData[i].name)
                .style("font-size", 10)
                .attr("fill", "black");

            arcs.append("text")
                .attr("transform", d => {
                var c = arc.centroid(d);
                return "translate("  + c[0] + "," + c[1] + ")";
                })
                .attr("text-anchor", "middle")
                .text((d, i) => `${Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 100)}%`)
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
                .innerRadius(60)
                .outerRadius(120)
            
            weapon_pie_g = svg.append("g")
                .attr("transform", `translate(525, 450)`);
            
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
                return "translate("  + c[0] * 1.8 + "," + c[1] * 1.6 + ")";
                })
                .attr("text-anchor", "middle")
                .text((d, i) => weaponPieData[i].name)
                .style("font-size", 10)
                .attr("fill", "black");

            arcs.append("text")
                .attr("transform", d => {
                var c = arc.centroid(d);
                return "translate("  + c[0] + "," + c[1] + ")";
                })
                .attr("text-anchor", "middle")
                .text(function(d, i) {
                    if(-Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) > 1){
                        return `${-Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 100)}%`
                    }
                })
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

        activateFunctions[0] = showTitle;
        activateFunctions[1] = showMap;
        activateFunctions[2] = showMapDots;
        activateFunctions[3] = showMapGradient;
        activateFunctions[4] = showHeat; // empty page
        activateFunctions[5] = showHeatState;
        activateFunctions[6] = showHeat;
        activateFunctions[7] = showLine;
        activateFunctions[8] = showPie;
        activateFunctions[9] = showHeat;

        for (var i = 0; i < 10; i++) {
            updateFunctions[i] = function () {};
        }
    };

    /**
     * ACTIVATE FUNCTIONS
     */
     function showTitle() {
        g.selectAll('.event-title')
        .transition()
        .duration(0)
        .attr('opacity', 1);

        hideMap(map_g);
        hideMaptext(map_text_g);
        hideMapcount(map_count_g);
        hideHeatState(heat_state_g,legend,heat_rects);
        hideDots(circle_g)
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
            map_g
            .transition()
            .duration(600)
            .attr('opacity', 1.0)
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
        hideMapcount(map_count_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g )
        hideHeatState(heat_state_g,legend,heat_rects);
        hideDots(circle_g)
    }
    function showMapDots(){
        hideMapcount(map_count_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        if(map_g){
            map_g
            .transition()
            .style("fill","#E5E4E2")
            circle_g
            .transition()
            .duration(1000)
            .attr('opacity', 1.0)
        }
    }
    /**
     * showMapGradient
     *
     * hides: intro, map, heatmap, pie
     * shows: map with gradient, states text
     *
     */
    function showMapGradient() {
        hideDots(circle_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        hideLine(line_g);
        if (map_g) {
            map_g
            .transition()
            .style("fill",(d) => {
                if(valuemap.get(d.properties.name) && valuemap.get(d.properties.name)== "Very High") {
                    return color_gradient(valuemap.get(d.properties.name)) 
                } else {
                    return "#E5E4E2"
                };
            })
        }
        if (map_text_g) {
            map_text_g
            .transition()
            .duration(0)
            .attr('opacity', 1.0);
        }
        if(map_count_g){
            map_count_g
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
        hideMap(map_g);
        hideMaptext(map_text_g);
        hideMapcount(map_count_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        hideHeatState(heat_state_g,legend,heat_rects);
        hideLine(line_g);
    }
    function showHeatState() {
        hideMap(map_g);
        hideMaptext(map_text_g);
        hideMapcount(map_count_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        hideLine(line_g);
        if (heat_state_g) {
            heat_state_g
            .transition()
            .duration(1000)
            .attr('opacity', 1.0);
            heat_rects
            .transition()
            .duration(1000)
            .attr('opacity', 1.0)
            legend
            .transition()
            .duration(2000)
            .attr('opacity', 1.0);
                   
            const rowHeight = 30;
            const RectsHeight = rowHeight * heatmaps_state.highStates.length + margin.top + margin.bottom;

            // Update y-axis scale domain
            y.domain(heatmaps_state.highStates)
            .range([height/4+20, height/4+RectsHeight+20 - margin.bottom])
            y_axis.transition()
            .duration(6000)
            .call(d3.axisLeft(y).tickSize(0))
            .call(g => g.select(".domain").remove())
            x_axis.transition()
            .duration(6000)
            .attr("transform", `translate(0,${height/4-height/15-10})`)

            heat_state_g.selectAll("#long_rects")
            .data(heatmaps_state.twoDArray)
            .transition()
            .duration(6000)
            .attr("transform", (d, i) => `translate(0,${y(heatmaps_state.updatedStates[i])? y(heatmaps_state.updatedStates[i]): -100})`)
            heat_state_g.selectAll("#small_rects")
            .attr("height", y.bandwidth()-1)
        } 
    }
   


    function showPie() {
        
        // hideMap();
        // hideMaptext();
        // hideHeat();
        hideLine(line_g);
        
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
            .duration(1200)
            .attr('opacity', 1.0);
        }
        if (weapon_pie_g) {
            weapon_pie_g
            .transition()
            .duration(1800)
            .attr('opacity', 1.0);
        }

    }

    function showLine() {
        
        // hideMap();
        // hideMaptext();
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        hideHeatState(heat_state_g,legend,heat_rects);
        
        // ensure the axis to histogram one
        if (line_g) {
            line_g
            .transition()
            .duration(600)
            .attr('opacity', 1.0);

            ageLine.call(transition);

            avgLine.call(transition);


            // line_g.append("path")
            //     .datum(lineChartData)
            //     .attr("fill", "none")
            //     .attr("stroke", "steelblue")
            //     .attr("stroke-width", 1)
            //     .attr("d", line)
            //     .attr('class', 'age-line')
            //     .call(transition);
            
        }

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
    // function showCough() {
    //     // ensure the axis to histogram one
    //     // hideAxis();
    //     hidePie();
    //     hideHeat();
    //     hideLine();

    //     g.selectAll('.hist')
    //     .transition()
    //     .duration(600)
    //     .attr('y', function (d) { return yHistScale(d.length); })
    //     .attr('height', function (d) { return height - yHistScale(d.length); })
    //     .style('opacity', 1.0);

    // }


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
    // function updateCough(progress) {
    //     hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        
    //     hideHeat();
    //     g.selectAll('.cough')
    //     .transition()
    //     .duration(0)
    //     .attr('opacity', progress);

    //     g.selectAll('.hist')
    //     .transition('cough')
    //     .duration(0)
    //     .style('fill', function (d) {
    //         return (d.x0 >= 14) ? coughColorScale(progress) : '#008080';
    //     });
    // }


   

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
        d3.selectAll('.step')
        .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

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
}
#vis {
  display: inline-block;
  position: fixed;
  z-index: 1;
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





</style>