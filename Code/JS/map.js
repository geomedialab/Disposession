var map = L.map('map',
    {
        minZoom: 10,
        // maxBounds: [[45.943618, -74.272889], [45.422965, -73.860249]],
        center: [45.569934, -74.082510],
        zoom: 10,
        timeDimension: true,
        timeDimensionControl: true,

        timeDimensionOptions: {
            position: 'center',
            timeSliderDragUpdate: true,
            autoplay: true,
            times: [1780, 1781, 1782, 1783, 1784, 1785, 1786, 1787, 1788, 1789, 1790, 1791, 1792, 1793, 1794, 1795, 1796, 1797, 1798, 1799, 1800, 1801, 1802, 1803, 1804, 1805, 1806, 1807, 1808, 1809, 1810, 1811, 1812, 1813, 1814, 1815, 1816, 1817, 1818, 1819, 1820, 1821, 1822, 1823, 1824, 1825, 1826, 1827, 1828, 1829, 1830, 1831, 1832, 1833, 1834, 1835, 1836, 1837, 1838, 1839, 1840, 1841, 1842, 1843, 1844, 1845, 1846, 1847, 1848, 1849, 1850, 1851, 1852, 1853, 1854, 1855, 1856, 1857, 1858, 1859, 1860, 1861, 1862, 1863, 1864, 1865, 1866, 1867, 1868, 1869, 1870, 1871, 1872, 1873, 1874, 1875, 1876, 1877, 1878, 1879, 1880, 1881, 1882, 1883, 1884, 1885, 1886, 1887, 1888, 1889, 1890, 1891, 1892, 1893, 1894, 1895, 1896, 1897, 1898, 1899, 1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917, 1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960]
        },
        // This is the options for the toolbar
        timeDimensionControlOptions: {
            timeZones: ["Local", "UTC"]
        }
    });


// Basemap
var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});
Stadia_AlidadeSmoothDark.addTo(map);

var primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color');

var fullCadasterStyle = {
    "color": primaryColor,
    "weight": 0.5,
    "opacity": 1,
};

// Adding the Cadaster
fetch('../../Data/GEOJSON/Full_Cadaster.geojson')
    .then((response) => response.json())
    .then((data) => cadasterData = data)
    .then(() => {

        // Create the popups
        cadasterLayer = L.geoJSON(
            cadasterData,
            setOptions = {

                style: fullCadasterStyle,
                onEachFeature: function (feature, layer) {
                    // Capitalize the first word of original deed sale variable
                    const word = feature.properties.ORIGINAL_A
                    const capitalized =
                        word.charAt(0)
                        + word.slice(1).toLowerCase()


                    layer.bindTooltip(
                        `<center><h2>Lot number ${feature.properties.LOT_NUMBER}</h2><h3>Sold ${feature.properties.times}</center></h3>
                    Sold by: ${feature.properties.SOLD_BY}<br>
                    Sold to: ${feature.properties.CONCEDED_T}<br>
                    Notes: ${feature.properties.NOTES}<br><br>
                    Found original sale: ${capitalized}`,
                        {
                            sticky: true,
                            opacity: 0.8,
                        });
                }
            }).addTo(map);

            // Dynamically build selection options for queries
            var soldByIndex = []
            createSoldbyIndex(soldByIndex)

            var soldToIndex = []
            createSoldToIndex(soldToIndex)

            var numEnregiIndex = []
            createnumEnregiIndex(numEnregiIndex)

            var origAIndex = []
            createorigAIndex(origAIndex)

            var lotNumberIndex = []
            createLotNumberIndex(lotNumberIndex)

            var yearSoldIndex = []
            createYearSoldIndex(yearSoldIndex)
    });