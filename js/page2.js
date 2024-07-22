const tooltip = d3.select(".tooltip");

// Define multiple color maps for different criteria
const colorMaps = {
    genre: d3.scaleOrdinal(d3.schemeCategory10), // using D3's category10 scale for different colors
    imdbRating: d3.scaleThreshold()
                  .domain([8])
                  .range(["red", "green"]) // red for ratings below 8, green for ratings 8 and above
};

function drawChart(colorCriterion = 'genre') {
    d3.csv("data.csv").then(function(data) {
        data.forEach(function(d) {
            d.Gross = parseInt(d.Gross.replace(/,/g, ''));
            d.IMDB_Rating = parseFloat(d.IMDB_Rating);
        });

        // Group by genre and sum earnings
        const earningsByGenre = d3.rollup(data, v => ({
            gross: d3.sum(v, d => d.Gross),
            avgRating: d3.mean(v, d => d.IMDB_Rating)
        }), d => d.Genre);
        
        let dataArray = Array.from(earningsByGenre, ([genre, values]) => ({ genre, ...values }));

        // Filter for top 20 genres
        dataArray = dataArray.sort((a, b) => b.gross - a.gross).slice(0, 20);

        // Dimensions
        const margin = { top: 20, right: 20, bottom: 120, left: 80 };
        const width = 1000 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // Scales
        const xScale = d3.scaleBand()
            .domain(dataArray.map(d => d.genre))
            .range([0, width])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(dataArray, d => d.gross)])
            .range([height, 0]);

        const svg = d3.select("#bar-container")
            .html("") // Clear any existing content
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Bars
        svg.selectAll(".bar")
            .data(dataArray)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.genre))
            .attr("width", xScale.bandwidth())
            .attr("y", d => yScale(d.gross))
            .attr("height", d => height - yScale(d.gross))
            .attr("fill", d => {
                if (colorCriterion === 'genre') {
                    return colorMaps.genre(d.genre);
                } else if (colorCriterion === 'imdbRating') {
                    return d.avgRating >= 8 ? "green" : "red";
                }
            })
            .on("mouseover", function(event, d) {
                // Show tooltip
                tooltip.style("display", "block")
                    .html(`
                        <strong>Genre:</strong> ${d.genre}<br>
                        <strong>Total Gross Earnings:</strong> $${d.gross.toLocaleString()}<br>
                        <strong>Average IMDb Rating:</strong> ${d.avgRating.toFixed(2)}
                    `)
                    .style("left", (event.pageX + 15) + "px")
                    .style("top", (event.pageY - 40) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("display", "none");
            });

        // Axes
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("text-anchor", "end")
            .style("font-size", "10px");

        svg.append("g")
            .call(d3.axisLeft(yScale).tickFormat(d => `$${d / 1e9}B`));

        // Labels
        svg.append("text")
            .attr("class", "axis-label")
            .attr("x", width / 2)
            .attr("y", height + 50)
            .attr("text-anchor", "middle")
            .text("Genre")
            .style("font-family", "Arial")
            .style("font-size", "12px");

        svg.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -60)
            .attr("text-anchor", "middle")
            .text("Total Gross Earnings (in Billions)")
            .style("font-family", "Arial")
            .style("font-size", "12px");
    });
}

// Call the function with the default color criterion
drawChart('genre'); // Change 'genre' to 'imdbRating' or 'gross' as needed
