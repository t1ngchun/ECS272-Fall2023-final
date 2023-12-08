<template>
    <div id='graphic'>
        <div id='sections'>
            <section class="step">
                reference: <br>
                <a href="https://www.kaggle.com/datasets/joebeachcapital/school-shootings">Dataset/</a>
                <a href="https://www.iconfinder.com/icons/2131923/gun_killing_school_shooting_terrorism_terrorist_war_icon">Picture</a>
            </section>
            <section class="step boarder">
                <div class="title">What happened in the Columbine High School Event?</div>
                <span id="intro">
                    The Columbine High School massacre was a school shooting incident 
                    that occurred on <span style="font-weight: bold;">April 20, 1999, at Columbine High School in Colorado, USA</span>. Two teenage students armed with firearms and explosives, 
                    entered the campus, resulting in the shooting deaths of 12 students and 1 teacher, 
                    with 21 others injured. Subsequently, both of them took their own lives. 
                    <span style="font-weight: bold;">This event is regarded as the deadliest school shooting incident in American history. </span>
                    The term "Columbine" became synonymous  with school shootings.
                </span>
            </section>
            <section class="step boarder">
                <div class="title">The Columbine Shooting Event triggers a lots of school shooting events in the U.S. since 1999 until now.</div>
                There are total 387 events. <br>
            </section>
            <section class="step boarder">
                <div class="title">We notice that some of the states has high frequency of events occurence.</div>
                During this period of time, we found out California (40), Texas (25), Florida (24) have the most number of school shooting events.
                <div class="title">Why do these states have high occurence?</div>
                1. Gun Culture / Legislation<br>
                2. Popularity Density<br>
                3. Geographical Location<br>
            </section>
            <section class="step boarder">
                <div class="title">We delve into the history about Gun Law of the U.S.</div>
                1. <span style="font-weight: bold;">Gun Culture / Legislation</span><br>
                2. Popularity Density<br>
                3. Geographical Location<br>
            </section>
            <section class="step boarder">
                <div class="title">We break down into individual years, the heatmap shows the occurence of the events in each year.</div>
                However, when hovering through rectangle with dark color, the year it happened does not fit the year those legislation we mentioned before launched. 
            </section>
            <section class="step boarder">
                <div class="title">We give border to the rectangle which contain the high casualties event. Events with the most victims are:</div>
                - <span style="font-weight: bold;">Columbine High School</span> <br>1999, Colorado, with 34 victims<br>
                - <span style="font-weight: bold;">Sandy Hook Elementary School</span><br> 2012, Connecticut, with 28 victims<br>
                - <span style="font-weight: bold;">Santa Fe High School</span> <br>2018, Texas, with 34 victims<br>
                - <span style="font-weight: bold;">Parkland High School</span><br> 2018, Florida, with 23 victims<br>
                - <span style="font-weight: bold;">Robb Elementary School</span><br> 2022, Texas, with 33 victims<br>
            </section>
            <section class="step boarder">
                <div class="title">We start to think about which attribute is more important when we analyze school shooting event? </div>
                Occurence? or Casualty?
            </section>
            <section class="step boarder">
                <div class="title">We start putting our attention on these tragedy event with high casualties.</div>
                With the same US map showing before but highlighting those with casualties more than 10 people. There are 9 events in total.
            </section>
            <section class="step boarder">
                <div class="title">We observed a correspondence between high-casualty events and the introduction of legislation in the same year.</div>
            </section>
            <section class="step boarder">
                <div class="title">How old are the shooter? How many victims are there in these events?</div>
                We found out that the average age of the shooter who commit serious shooting is higher than the average age of all shooting events.
            </section>
            <section class="step boarder">
                <div class="title">Background Information of the Shooters of school shooting with serious casualties</div>
                1. Where did they get the weapon? Is there any family issues among them?<br>
                2. Did they commit suicide after? Do they have mental health issues?<br>
                3. Did they hurt certain people? Are those copycat behaviors?<br>
            </section>
            <section class="step boarder">
                After exploring the data, this is our takeaway.
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
import { hideMap, hideMaptext, hideMapcount, hideDots, hideHeatState, hideCompare, hidePie, hidePar, hideText} from "./hidecomponent"

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
// for geo map:count occurence of state events
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
    const Q3 = 15//d3.quantile(sortedValues, 0.75);
    const max = d3.max(sortedValues);
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

function getHeatMapData_state(data) {
    const infoData = data.map(item => {
        return {
            school_name: item.school_name,
            killed: item.killed,
            injured: item.injured,
            state: item.state,
            year: !isNaN(item.year) ? +item.year : item.year
        };
    });
    const years = [...new Set(data.map(item => item.year))]
    const states = [...new Set(data.map(item => item.state))]
    //map occurence value to state
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
    twoDArray.forEach((stateArray, stateIndex) => {
        stateArray.forEach((yearData, yearIndex) => {
            const correspondingInfo = infoData.filter(item => {
                return (
                    item.state === yearData.state &&
                    item.year === (1999 + yearIndex) // Assuming the year starts from 1999
                );
            });

            if (correspondingInfo.length > 0) {
                twoDArray[stateIndex][yearIndex].events = correspondingInfo.map(item => ({
                    school_name: item.school_name,
                    injured: item.injured,
                    killed: item.killed,
                    state: item.state,
                    year: item.year,
                }));
            }
        });
    });
    return {
        twoDArray,
        values1DArray,
        sortedStatesByOccurrence, //map each state with occurence value and category
        updatedStates, //for ordering all states based on occurence
        highStates,  //for heatmap transition
        years, //years array
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
            killed: +value.killed,
            injured: +value.injured,
            casualties: +value.casualties,
            safe: (+value.enrollment)-(+value.casualties),
            age_shooter: +(value.age_shooter1),
            shooting_type: filterShootingType(value.shooting_type),
            shooter_deceased: filterShooterDeceased(value.shooter_deceased1, value.deceased_notes1),
            weapon_source: filterWeaponSource(value.weapon_source),
        }
        if (processedObj.year) {
            formattedData.push(processedObj);
        }
    });
    formattedData = formattedData.filter(d => d.casualties > 10 )
    return formattedData;
}
// for line chart
function getShooterAgeData(data) {
    let filteredData = filteredPieChartData(data)
    //console.log(filteredData)
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
        { name: 'alive', value: alive / 13},
        { name: 'N/A', value: others / 13},
        { name: 'suicide', value: suicide / 13},
        { name: 'killed by police', value: police / 13},
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
        { name: 'targeted', value: targeted / 13},
        { name: 'indiscriminate', value: indiscriminate / 13},
        { name: 'accidental', value: accidental / 13},
        { name: 'N/A', value: others / 13},
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
        { name: 'family', value: family / 13},
        { name: 'issued', value: issued / 13},
        { name: 'friend', value: friend / 13},
        { name: 'stolen', value: stolen / 13},
        { name: 'purchased', value: purchased / 13},
        { name: 'N/A', value: others / 13},
    ];
}

let convertedData = null;
let shootings = null;
let heatmaps_state = null;
// let heatmaps_casaulties = null;
let deceasedPieData = null;
let shootingPieData = null;
let weaponPieData = null;
let lineChartData = null;
let parallelChartData = null;
d3.csv('../../data/school-shootings.csv')
  .then(function(loadedData) {
    convertedData = loadedData.map(item => {
        return {
            ...item,
            casualties: +item.casualties,
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
    parallelChartData = filteredPieChartData(convertedData)
    // console.log(parallelChartData)
    display(parallelChartData)
    lineChartData = getShooterAgeData(loadedData)
    display(lineChartData)

    deceasedPieData = getDeceasedData(loadedData).filter(d => d.value > 0)
    display(deceasedPieData)
    shootingPieData = getShootingData(loadedData).filter(d => d.value > 0)
    display(shootingPieData)
    weaponPieData = getWeaponData(loadedData).filter(d => d.value > 0)
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

    let img = null;
    let img_law = null;
    let imag_event = null;
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
    let legend_p = null;
    let xAxis_1999 = null;
    let xAxis_2003 = null;
    let parallel_g = null;

    // for geomap
    const valuemap = new Map(shootings?.map(d => [d.name, d.occ_cat]));
    const countmap = new Map(shootings?.map(d => [d.name, d.value]));
    const color_gradient = d3.scaleOrdinal(d3.schemeReds[4]).domain(["Low", "Moderate", "High", "Very High"])
    const color_state = d3.scaleOrdinal(d3.schemeBuPu[6]).domain(["0", "1", "2", "3", "4", "5", "6"])


    var setupVis = function () {
        
        img = g.append("g:image").attr("class","coverimg").attr("id","coverimg")
                    .attr("xlink:href", "../../data/shooting_img.png")
                    .attr("opacity", 1.0)
                    // .attr("width", width*4.5/5)
                    // .attr("y", height/2-100)
        img_law = g.append("g:image").attr("class","lawimg")
        .attr("xlink:href", "../../data/law.png")
        .attr("opacity", 1.0)
        .attr("width", width*4.5/5)
        .attr("x",margin.left+10)
        .attr("y", height/2-100)
        .attr("opacity",0)

        imag_event = g.append("g:image").attr("class","laweventimg")
        .attr("xlink:href", "../../data/law_event.png")
        .attr("opacity", 1.0)
        .attr("width", width*4.5/5)
        .attr("x",margin.left+10)
        .attr("y", height/8)
        .attr("opacity",0)



        g.append('text')
        .attr('class', 'title event-title')
        .attr('x', width / 2)
        .attr('y', height / 5)
        .text('School Shootings Event in the US')
        .attr('font-size', '50px')
        .attr("font-family", "TiemposTextWeb-Regular","Georgia")
        .attr("font-weight", "bold")
        .attr('text-anchor', 'middle');

        g.append('text')
        .attr('class', 'sub-title event-title')
        .attr('x', width / 2)
        .attr('y', (height / 5) + (height / 10))
        .text('Influenced by Columbine Shooting Event')
        .attr('text-anchor', 'middle')
        .attr("font-size", "30px")
        .attr("font-family", "TiemposTextWeb-Regular","Georgia")
        .attr("fill", "#767678");
        g.selectAll('.event-title')
        .attr('opacity', 0);


        g.append('text')
        .attr('class', 'title compare-title')
        .attr('x', width/2)
        .attr('y', height / 4)
        .text('Occurence')
        .attr('font-size', '100px')
        .attr("font-family", "TiemposTextWeb-Regular","Georgia")
        .attr("font-weight", "bold")
        .attr('text-anchor', 'middle');

        g.append('text')
        .attr('class', 'title compare-title')
        .attr('x', width/2)
        .attr('y', height / 2)
        .text('V.S.')
        .attr('font-size', '100px')
        .attr("font-family", "TiemposTextWeb-Regular","Georgia")
        .attr("font-weight", "bold")
        .attr('text-anchor', 'middle');


        g.append('text')
        .attr('id', 'casualties')
        .attr('class', 'title compare-title')
        .attr('x', width/2)
        .attr('y', height-height/4)
        .text('Casualty')
        .attr('font-size', '100px')
        .attr("font-family", "TiemposTextWeb-Regular","Georgia")
        .attr("font-weight", "bold")
        .attr('text-anchor', 'middle');
        g.selectAll('.compare-title')
        .attr('opacity', 0);



        const rectWidth = 300;
        const rectHeight = 50;

        // Append a rectangle
        const rectangle = g.append("rect").attr("id","textrect")
            .attr("x", 50)
            .attr("y", 50)
            .attr("width", width-120)
            .attr("height", height-100)
            .attr("fill", '#d8e2dc');
        // Text content with multiple sentences
        const textContent = "- Event casualty have more impact on the lauching of gun law than.  event occurence of the year and state that happen shooting event.  the most does not mean that state has the most number of victims.";
        const textContent2 = "- Since The United States has a long history of gun culture, the gun.  law is not strict enough to prevent the tragedy from happening.";
        const textContent3 = "- The main resaons for happening young shooting events in school.  may be mental health issues, family issues, and media impact.";
        // Split text content into sentences
        const sentences = textContent.split('. ');
        const sentences2 = textContent2.split('. ');
        const sentences3 = textContent3.split('. ');
        // Append text within the rectangle using tspan for each sentence
        const text = g.append("text").attr("id","text")
            .attr("x", 50 + 10) // Offset the text from the left edge of the rectangle
            .attr("y", 50 + rectHeight / 2+50) // Center text vertically
            .style("fill", "black")
            .attr("font-family", "Arial,Helvetica","san-serif")
            .style("font-size", "25px");

        text.selectAll("tspan")
            .data(sentences)
            .enter().append("tspan")
            .attr("x", 100 + 10) // Offset the text from the left edge of the rectangle
            .attr("dy", "1.2em") // Adjust spacing between lines
            .text(d => d);
        const text2 = g.append("text").attr("id","text")
            .attr("x", 50 + 10) // Offset the text from the left edge of the rectangle
            .attr("y", 50 + (rectHeight / 2)*6+50) // Center text vertically
            .style("fill", "black")
            .attr("font-family", "Arial,Helvetica","san-serif")
            .style("font-size", "25px");

        text2.selectAll("tspan")
            .data(sentences2)
            .enter().append("tspan")
            .attr("x", 100+10) // Offset the text from the left edge of the rectangle
            .attr("dy", "1.2em") // Adjust spacing between lines
            .text(d => d);
        const text3 = g.append("text").attr("id","text")
            .attr("x", 50 + 10) // Offset the text from the left edge of the rectangle
            .attr("y", 50 + (rectHeight / 2)*10+50) // Center text vertically
            .style("fill", "black")
            .attr("font-family", "Arial,Helvetica","san-serif")
            .style("font-size", "25px");

        text3.selectAll("tspan")
            .data(sentences3)
            .enter().append("tspan")
            .attr("x", 100+10) // Offset the text from the left edge of the rectangle
            .attr("dy", "1.2em") // Adjust spacing between lines
            .text(d => d);
        // // Append text within the rectangle
        // const text = g.append("text")
        //     .attr("x", 50 ) // Center text horizontally
        //     .attr("y", 50 + rectHeight / 2) // Center text vertically
        //     // .attr("text-anchor", "middle") // Center align text horizontally
        //     .attr("dominant-baseline", "middle") // Center align text vertically
        //     .text("1. Event casualty are more related to the lauch of gun law than event occurence. Also, state that happen shooting event the most does not mean high casualty.")
        //     .style("fill", "black")
        //     .style("font-size", "16px");



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
            // console.log(convertedData)
            var size = d3.scaleLinear()
                 .domain([0,34])
                 .range([3,10]);
            circle_g = g.append("g").attr("id","circle_g_p").append("g")             
            .selectAll("circle")
            .data(convertedData.filter(d=>d.long!=0 && d.lat!=0))
            .enter()
            .append("circle").attr("id","circle")        
            .attr("cx", d => {
                return projection([d.long,d.lat])[0];
            })
            .attr("cy", d => {
                return projection([d.long,d.lat])[1];
            })
            .attr("r", 3)
            .attr("fill", '#262626'); //'#bfd3e6','#9ebcda','#8c96c6','#8c6bb1','#88419d','#810f7c'
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
        if (circle_g) {
            circle_g.attr('opacity', 0);
        }
        if(parallelChartData){
            parallel_g = g.append("g")
            let key:string[] = ['age_shooter','casualties','injured','killed']
            let yAge = d3.scaleLinear()
                            .domain(d3.extent(parallelChartData.map(d => d.age_shooter)) )
                            .range([height- height/3, height/4])
            let yInjured = d3.scaleLinear()
                            .domain(d3.extent(parallelChartData.map(d => d.injured)) )
                            .nice()
                            .range([height- height/3, height/4])
            let yKilled = d3.scaleLinear()
                            .domain(d3.extent(parallelChartData.map(d => d.killed)) )
                            .nice()
                            .range([height- height/3, height/4])
            let ySafe = d3.scaleLinear()
                            .domain(d3.extent(parallelChartData.map(d => d.casualties)) )
                            .nice()
                            .range([height- height/3, height/4])
            
            let xScale = d3.scalePoint()
                  .range([margin.left+20, width - margin.right-100])
                  .padding(0.01)
                  .domain(key);
            
            var y = {}
            y[key[0]] = yAge
            y[key[1]] = ySafe
            y[key[2]] = yInjured
            y[key[3]] = yKilled

            function path(d) {
                return d3.line()(key.map(function(p) { return [xScale(p), y[p](d[p])+50]; }));
            }
            parallel_g.append('g')
                .selectAll("myPath")
                .data(parallelChartData)
                .enter().append("path")
                .attr("d",  path)
                .style("fill", "none")
                .style("stroke","#cb181d")
                .style("opacity", 0.7)
                .style('stroke-width', '1.5px')
            parallel_g.append("g").attr("transform", "translate(" + xScale(key[0]) + ",50)")
            .call(d3.axisLeft(yAge)
            .tickFormat(d => {
               return d.toString()
             })
             .ticks(6, "f"))
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", height/5)
            .text(key[0])
            .style("fill", "#767678")
            .style('font-weight', 'bold')
            .style('font-size', '.9rem')

            parallel_g.append("g").attr("transform", "translate(" + xScale(key[1]) + ",50)")
            .call(d3.axisLeft(ySafe)
            .tickFormat(d => {
               return d.toString()
             })
             )
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", height/5)
            .text(key[1])
            .style("fill", "#767678")
            .style('font-weight', 'bold')
            .style('font-size', '.9rem')

            parallel_g.append("g").attr("transform", "translate(" + xScale(key[2]) + ",50)")
            .call(d3.axisLeft(yInjured)
            .tickFormat(d => {
               return d.toString()
             }))
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", height/5)
            .text(key[2])
            .style("fill", "#767678")
            .style('font-weight', 'bold')
            .style('font-size', '.9rem')

            parallel_g.append("g")
            .attr("transform", "translate(" + xScale(key[3]) + ",50)")
            .call(d3.axisRight(yKilled)
            .tickFormat(d => {
               return d.toString()
             }))
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", height/5)
            .text(key[3])
            .attr("fill", "gray")
            .style('font-weight', 'bold')
            .style('font-size', '.9rem')

            // Draw the triangle mark
            var sym = d3.symbol().type(d3.symbolTriangle).size(100); 
            parallel_g.append("g")
                .attr("transform",  `translate(${xScale('age_shooter')+85}, ${yAge(17.5)+55})`)
                .append("text")
                .style("font-size", 15)
                .style("fill", 'black') //'#ffcad4'
                .style("font-weight", "bold")
                .text("Average Age: 17.5")
                .style("text-anchor", "middle")
            parallel_g.append("path") 
                .attr("d", sym) 
                .attr("fill", 'black') 
                .attr("transform", `translate(${xScale('age_shooter')+10}, ${yAge(17.5)+50}) rotate(270)`);
            parallel_g.append("g")
            .attr("transform",  `translate(${xScale('age_shooter')+100}, ${yAge(15)*2-yAge(16)+55})`)
            .append("text")
            .style("font-size", 15)
            .style("fill", '#767678') //'#ffcad4'
            .style("font-weight", "bold")
            .text("Average Age (all) : 14")
            .style("text-anchor", "middle")
            parallel_g.append("path") 
                .attr("d", sym) 
                .attr("fill", '#767678') 
                .attr("transform", `translate(${xScale('age_shooter')+10}, ${yAge(15)*2-yAge(16)+50}) rotate(270)`);
        }
        if(parallel_g){
            parallel_g.attr('opacity', 0)
        }

        // pie chart
        var deceasedColor = d3.scaleOrdinal(['#d8e2dc', 'white', '#ffcad4','#d8e2dc' ]);
        var shootingColor = d3.scaleOrdinal(['#ffcad4', '#d8e2dc', '#d8e2dc', 'white']);
        var weaponColor = d3.scaleOrdinal(['#ffcad4', '#d8e2dc', '#d8e2dc', '#d8e2dc', '#d8e2dc', 'white']);

        if (deceasedPieData) {
            var pie = d3.pie()
                .value((d) =>  d.value)
                .startAngle(0)
                .padAngle(.025)
                (deceasedPieData);

            var arc = d3.arc()
                .innerRadius(60)
                .outerRadius(120)
            
            deceased_pie_g = g.append("g")
                // .attr("class", "pie")
                .attr("transform", `translate(${width*0.77}, ${height*0.32})`);
            
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
                .style("fill", "#767678")
                .style('font-weight', 'bold');

            arcs.append("text")
                .attr("transform", d => {
                var c = arc.centroid(d);
                return "translate("  + c[0] + "," + c[1] + ")";
                })
                .attr("text-anchor", "middle")
                .text(function(d, i) {
                    if(Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) > 0){
                        return `${Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 99.5)}%`
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
            
            shooting_pie_g = g.append("g")
                .attr("transform", `translate(${width*0.5}, ${height*0.74})`);
            
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
                return "translate("  + c[0] * 1.8 + "," + (c[1] * 1.5+10) + ")";
                })
                .attr("text-anchor", "middle")
                .text((d, i) => shootingPieData[i].name)
                .style("fill", "#767678")
                .style('font-weight', 'bold');

            arcs.append("text")
                .attr("transform", d => {
                var c = arc.centroid(d);
                return "translate("  + c[0] + "," + c[1] + ")";
                })
                .attr("text-anchor", "middle")
                .text(function(d, i) {
                    if(Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) > 0){
                        return `${Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 100)}%`
                    }
                })
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
            
            weapon_pie_g = g.append("g")
                .attr("transform", `translate(${width*0.25}, ${height*0.32})`);
            
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
                .style("fill", "#767678")
                .style('font-weight', 'bold');
            
            arcs.append("text")
                .attr("transform", d => {
                var c = arc.centroid(d);
                return "translate("  + c[0] + "," + c[1] + ")";
                })
                .attr("text-anchor", "middle")
                .text(function(d, i) {
                    if(-Math.round((d.endAngle - d.startAngle) / (2 * Math.PI) * 100) > 0){
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

        if(heatmaps_state){
            heat_state_g = g.append("g").attr("id","heat_state_g").append("g")
            const rowHeight = 12;
            const RectsHeight = rowHeight * heatmaps_state.updatedStates.length + margin.top + margin.bottom;
            x = d3.scaleLinear()
                .domain([d3.min(heatmaps_state.years), d3.max(heatmaps_state.years) + 1])
                .range([margin.left+width/6, (width-margin.right-30)/1.1])
            y = d3.scaleBand()
                .domain(heatmaps_state.updatedStates)
                .rangeRound([height/25+10, height/25+10+RectsHeight - margin.bottom])
 

            x_axis = heat_state_g.append("g")
                .call(g => g.append("g")
                    .attr("transform", `translate(0,${height/20+10})`)
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

        
            const legendWidth = 200;
            const legendHeight = 15;

            legend = heat_state_g.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${margin.left + 5},${height / 1.5}) rotate(-90)`);

            const colorRange = Array.from({ length: 6 }, (_, i) => i.toString());

            legend.selectAll("rect")
                .data(colorRange)
                .enter().append("rect")
                .attr("x", (d, i) => i * (legendWidth / 6))
                .attr("y", -15)
                .attr("width", legendWidth / 6)
                .attr("height", legendHeight)
                .style("fill", d => color_state(d));

            // Optionally, add text labels for each rect
            legend.selectAll("text")
                .data(colorRange)
                .enter().append("text")
                .attr("transform", `translate(${legendWidth / 12},0) rotate(90)`)
                .attr("x", 25)
                .attr("y", (d, i) => -((i-1) * (legendWidth / 6)+ 1.5*(legendWidth / 12) ))
                .text(d => d)
                .style("fill", "#767678")
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

        }

        if(heat_state_g){
            heat_state_g.attr('opacity', 0);
            legend.attr('opacity', 0);
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
        activateFunctions[4] = showLaw;
        activateFunctions[5] = showHeatState;
        activateFunctions[6] = showHeat;
        activateFunctions[7] = showCompare; 
        activateFunctions[8] = showMapBigDot;
        activateFunctions[9] = showEvent;
        activateFunctions[10] = showPar;
        activateFunctions[11] = showPie;
        activateFunctions[12] = showSomething;

        for (var i = 0; i < 12; i++) {
            updateFunctions[i] = function () {};
        }
    };

    /**
     * ACTIVATE FUNCTIONS
     */
     function showTitle() {
        g.selectAll(".lawimg").style("opacity", 0)
        g.selectAll(".laweventimg").style("opacity", 0)
        if(heat_rects){
            d3.selectAll("#tooltip").remove();
        }
        d3.selectAll("#tooltip_circle").remove();
        g.selectAll(".coverimg").style("opacity", 0.2)
        g.selectAll(".lawimg").style("opacity", 0)
        g.selectAll('.event-title')
        .transition()
        .duration(0)
        .attr('opacity', 1);

        hideCompare();
        hideMap(map_g);
        hideMaptext(map_text_g);
        hideMapcount(map_count_g);
        hideHeatState(heat_state_g,legend,heat_rects);
        hideDots(circle_g);
        hidePar(parallel_g);
        hideText()
    }
    /**
     * showMap - draw the map
     *
     * hides: Topic title
     * shows: map highlight CO
     *
     */    
    function showMap() {
        g.selectAll(".lawimg").style("opacity", 0)
        if(heat_rects){
            d3.selectAll("#tooltip").remove();
        }
        d3.selectAll("#tooltip_circle").remove();
        g.selectAll(".coverimg").style("opacity", 0)
        g.selectAll(".lawimg").style("opacity", 0)
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
        hideCompare();
        hideMapcount(map_count_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g )
        hideHeatState(heat_state_g,legend,heat_rects);
        hideDots(circle_g);
        hidePar(parallel_g);
        hideText()
    }
    function showMapDots(){
        g.selectAll(".lawimg").style("opacity", 0)
        g.selectAll(".laweventimg").style("opacity", 0)
        if(heat_rects){
            d3.selectAll("#tooltip").remove();
        }
        d3.selectAll("#tooltip_circle").remove();
        d3.select("#circle_g_p").raise()
        hideCompare();
        hideMapcount(map_count_g);
        hidePar(parallel_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        hideText()
        var size = d3.scaleLinear()
                 .domain([0,34])
                 .range([3,10]);
        if(map_g){
            map_g
            .transition()
            .style("fill","#E5E4E2")
            circle_g
            .transition()
            .duration(3000)
            .attr('opacity', 1.0);

            d3.selectAll("#circle")
            .each(function(d) {
                const circle = d3.select(this);
                circle.append("title").attr("id", "tooltip_circle")
                    .text(() => {
                        
                        return `School: ${d.school_name}, Year: ${d.year}, Killed: ${d.killed}, Injured: ${d.injured}`
                        
                    })
            })
            
            
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
        g.selectAll(".lawimg").style("opacity", 0)
        if(heat_rects){
            d3.selectAll("#tooltip").remove();
        }
        d3.selectAll("#tooltip_circle").remove();
        hideCompare();
        hideDots(circle_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        hidePar(parallel_g);
        hideText()
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
            .duration(3000)
            .attr('opacity', 1.0);
        }
    }
    function showLaw(){
        if(heat_rects){
            d3.selectAll("#tooltip").remove();
        }
        d3.selectAll("#tooltip_circle").remove();
        hideMap(map_g);
        hideMaptext(map_text_g);
        hideMapcount(map_count_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        hideHeatState(heat_state_g,legend,heat_rects);
        hideDots(circle_g);
        hidePar(parallel_g);
        hideText()
        g.selectAll(".lawimg").style("opacity", 1.0)
        g.selectAll(".laweventimg").style("opacity", 0)
    }
    function showEvent(){
        if(heat_rects){
            d3.selectAll("#tooltip").remove();
        }
        g.selectAll(".lawimg").style("opacity", 0.0)
        g.selectAll(".laweventimg").style("opacity", 1.0)
        hideMap(map_g);
        hideMaptext(map_text_g);
        hideMapcount(map_count_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        hideHeatState(heat_state_g,legend,heat_rects);
        hideDots(circle_g);
        hidePar(parallel_g);
        hideText()
        
    }
    function showMapBigDot(){
        g.selectAll(".lawimg").style("opacity", 0)
        g.selectAll(".laweventimg").style("opacity", 0)
        if(heat_rects){
            d3.selectAll("#tooltip").remove();
        }
        d3.selectAll("#tooltip_circle").remove();
        d3.select("#circle_g_p").raise()
        hideCompare();
        hideMapcount(map_count_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        hidePar(parallel_g);
        hideHeatState(heat_state_g,legend,heat_rects);
        hideText()
        var size = d3.scaleLinear()
                 .domain([0,34])
                 .range([3,10]);
        if(map_g){
            map_g
            .transition()
            .attr('opacity', 1.0)
            .style("fill","#E5E4E2")
            map_text_g
            .transition()
            .attr('opacity', 1.0)
            circle_g
            .transition()
            .duration(1000)
            .attr('opacity', 1.0)
            .style("r", "3")
            .transition(8000)
            .style("r",d=>{return size(d.casualties)})
            .style("fill", d=>{
                if(d.casualties > 10 ){
                    return "#cb181d"
                }
            })
            .style("opacity", d=>{
                if(d.casualties > 10){
                    return 1
                }
                else{
                    return 0
                }
            })

        }
    }
    function showSomething() {
        g.selectAll(".lawimg").style("opacity", 0)
        g.selectAll(".laweventimg").style("opacity", 0)
        if(heat_rects){
            d3.selectAll("#tooltip").remove();
        }
        d3.selectAll("#tooltip_circle").remove();
        hideMap(map_g);
        hideMaptext(map_text_g);
        hideMapcount(map_count_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        hideHeatState(heat_state_g,legend,heat_rects);
        hideDots(circle_g);
        hidePar(parallel_g);
        hideText()

        d3.selectAll("#textrect")
        .transition()
        .duration(0)
        .attr('opacity', 1);

        d3.selectAll("#text")
        .transition()
        .duration(0)
        .attr('opacity', 1);

    }
    function showCompare() {
        g.selectAll(".lawimg").style("opacity", 0)
        g.selectAll(".laweventimg").style("opacity", 0)
        if(heat_rects){
            d3.selectAll("#tooltip").remove();
        }
        d3.selectAll("#tooltip_circle").remove();
        hideMap(map_g);
        hideMaptext(map_text_g);
        hideMapcount(map_count_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        hideHeatState(heat_state_g,legend,heat_rects);
        hideDots(circle_g);
        hidePar(parallel_g);
        hideText()
        g.selectAll('.compare-title')
        .transition()
        .duration(0)
        .attr('opacity', 1);

        d3.selectAll('#casualties')
        .transition()
        .duration(3000)
        .style("font-size", "150px")
        .style("fill", "#cb181d")

    }
    function showPar(){
        
        g.selectAll(".lawimg").style("opacity", 0)
        g.selectAll(".laweventimg").style("opacity", 0)
        if(heat_rects){
            d3.selectAll("#tooltip").remove();
        }
        d3.selectAll("#tooltip_circle").remove();
        hideCompare();
        hideMap(map_g);
        hideMaptext(map_text_g);
        hideMapcount(map_count_g);
        hideHeatState(heat_state_g,legend,heat_rects);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        hideDots(circle_g);
        hideText()
        if(parallel_g){
            parallel_g
            .transition()
            .duration(0)
            .attr('opacity', 1.0);
        }
    }
    function showHeatState() {
        d3.selectAll("#tooltip_circle").remove();
        g.selectAll(".lawimg").style("opacity", 0)
        g.selectAll(".laweventimg").style("opacity", 0)
        hideCompare();
        hideMap(map_g);
        hideMaptext(map_text_g);
        hideMapcount(map_count_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        hideDots(circle_g);
        hidePar(parallel_g);
        hideText()
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
            x_axis.selectAll(".tick text")
            .attr("fill","black")
            .attr("font-weight","normal")
            .attr("font-size","10px")
            heat_state_g.selectAll("#small_rects").style("stroke", "none")
            .each(function(d) {
                const rect = d3.select(this);
                rect.append("title").attr("id", "tooltip")
                    .text(() => {
                        if (d.events) {
                            return d.events.map(event => `School: ${event.school_name}, Killed: ${event.killed}, Injured: ${event.injured}`).join('\n');
                        } else {
                            return 'No events available';
                        }
                    })

            });
            
            x_axis.selectAll(".tick text")
            .style("fill", d=>{
                if(d.toString() == "1999" ||
                   d.toString() == "2008" ||
                   d.toString() == "2015" ||
                   d.toString() == "2017" ||
                   d.toString() == "2018" ||
                   d.toString() == "2019" ||
                   d.toString() == "2022" 
                   ){
                    return "#cb181d"
                }
                else{
                    return "black"
                }
                
            })
            .style('font-weight', d=>{
                if(d.toString() == "1999" ||
                   d.toString() == "2008" ||
                   d.toString() == "2015" ||
                   d.toString() == "2017" ||
                   d.toString() == "2018" ||
                   d.toString() == "2019" ||
                   d.toString() == "2022" 
                   ){
                    return "bold"
                }
                else{
                    return "normal"
                }
                
            })
            .style('font-size', d=>{
                if(d.toString() == "1999" ||
                   d.toString() == "2008" ||
                   d.toString() == "2015" ||
                   d.toString() == "2017" ||
                   d.toString() == "2018" ||
                   d.toString() == "2019" ||
                   d.toString() == "2022" 
                   ){
                    return "0.7rem"
                }

                
            })
        } 
        
    }

    function showHeat() {
        d3.selectAll("#tooltip_circle").remove();
        g.selectAll(".lawimg").style("opacity", 0)
        g.selectAll(".laweventimg").style("opacity", 0)
        hideCompare();
        hideMap(map_g);
        hideMaptext(map_text_g);
        hideMapcount(map_count_g);
        hidePie(deceased_pie_g,shooting_pie_g,weapon_pie_g);
        hideDots(circle_g);
        hidePar(parallel_g);
        hideText()
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


            heat_state_g.selectAll("#small_rects")
            .each(function(d) {
                const rect = d3.select(this);

                if (d.events) {
                    d.events.map((v) => {
                        if (parseInt(v.injured) + parseInt(v.killed) > 10) {
                            rect.style("stroke", "none") // Initially hide the stroke
                            .style("stroke-width", 0) // Set stroke width to 0
                            .style("shape-rendering", "crispEdges"); // Ensures sharp edges for rectangles

                            // Add a transition to gradually show the stroke
                            rect.transition()
                                .delay(1000) // Delay the transition
                                .duration(1000) // Transition duration
                                .style("stroke", "#cb181d") // Outline color #fb6a4a
                                .style("stroke-width", 2); // Outline width
                       }
                    })
                }
            });
            

        } 
        
    }
   


    function showPie() {
      
        hideCompare();
        hideHeatState(heat_state_g,legend,heat_rects);
        hideDots(circle_g);
        hidePar(parallel_g);
        hideText()

        if(heat_rects){
            d3.selectAll("#tooltip").remove();
        }
        d3.selectAll("#tooltip_circle").remove();

        
        // ensure the axis to histogram one
        if (deceased_pie_g) {
            deceased_pie_g
            .transition()
            .duration(1200)
            .attr('opacity', 1.0);
        }
        if (shooting_pie_g) {
            shooting_pie_g
            .transition()
            .duration(1800)
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
  font-size: 14px;
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