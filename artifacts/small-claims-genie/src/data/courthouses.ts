export interface Courthouse {
  name: string;
  address: string;
  city: string;
  zip: string;
}

export const COUNTY_COURTHOUSES: Record<string, Courthouse[]> = {
  "Alameda": [
    { name: "Hayward Hall of Justice", address: "24405 Amador St", city: "Hayward", zip: "94544" },
    { name: "René C. Davidson Courthouse", address: "1225 Fallon St", city: "Oakland", zip: "94612" },
  ],
  "Alpine": [
    { name: "Alpine County Superior Court", address: "14777 State Route 89", city: "Markleeville", zip: "96120" },
  ],
  "Amador": [
    { name: "Amador County Superior Court", address: "500 Argonaut Ln", city: "Jackson", zip: "95642" },
  ],
  "Butte": [
    { name: "Butte County Superior Court", address: "1775 Concord Ave", city: "Chico", zip: "95928" },
  ],
  "Calaveras": [
    { name: "Calaveras County Superior Court", address: "400 Government Center Dr", city: "San Andreas", zip: "95249" },
  ],
  "Colusa": [
    { name: "Colusa County Superior Court", address: "532 Oak St", city: "Colusa", zip: "95932" },
  ],
  "Contra Costa": [
    { name: "Arnason Justice Center", address: "1020 Ward St", city: "Martinez", zip: "94553" },
    { name: "George D. Carroll Courthouse", address: "100 37th St", city: "Richmond", zip: "94805" },
  ],
  "Del Norte": [
    { name: "Del Norte County Superior Court", address: "450 H St", city: "Crescent City", zip: "95531" },
  ],
  "El Dorado": [
    { name: "El Dorado County Superior Court", address: "1354 Johnson Blvd", city: "South Lake Tahoe", zip: "96150" },
    { name: "Main Street Courthouse", address: "495 Main St", city: "Placerville", zip: "95667" },
  ],
  "Fresno": [
    { name: "B.F. Sisk Courthouse", address: "1130 O St", city: "Fresno", zip: "93721" },
  ],
  "Glenn": [
    { name: "Glenn County Superior Court", address: "526 W Sycamore St", city: "Willows", zip: "95988" },
  ],
  "Humboldt": [
    { name: "Humboldt County Superior Court", address: "825 5th St", city: "Eureka", zip: "95501" },
  ],
  "Imperial": [
    { name: "Imperial County Superior Court", address: "939 W Main St", city: "El Centro", zip: "92243" },
  ],
  "Inyo": [
    { name: "Inyo County Superior Court", address: "168 N Edwards St", city: "Independence", zip: "93526" },
  ],
  "Kern": [
    { name: "Metropolitan Division", address: "1215 Truxtun Ave", city: "Bakersfield", zip: "93301" },
  ],
  "Kings": [
    { name: "Kings County Superior Court", address: "1426 South Dr", city: "Hanford", zip: "93230" },
  ],
  "Lake": [
    { name: "Lake County Superior Court", address: "255 N Forbes St", city: "Lakeport", zip: "95453" },
  ],
  "Lassen": [
    { name: "Lassen County Superior Court", address: "2610 Riverside Dr", city: "Susanville", zip: "96130" },
  ],
  "Los Angeles": [
    { name: "Stanley Mosk Courthouse", address: "111 N Hill St", city: "Los Angeles", zip: "90012" },
    { name: "Chatsworth Courthouse", address: "9425 Penfield Ave", city: "Chatsworth", zip: "91311" },
    { name: "Compton Courthouse", address: "200 W Compton Blvd", city: "Compton", zip: "90220" },
    { name: "Glendale Courthouse", address: "600 E Broadway", city: "Glendale", zip: "91206" },
    { name: "Inglewood Courthouse", address: "One Regent St", city: "Inglewood", zip: "90301" },
    { name: "Long Beach Courthouse", address: "275 Magnolia Ave", city: "Long Beach", zip: "90802" },
    { name: "Pasadena Courthouse", address: "300 E Walnut St", city: "Pasadena", zip: "91101" },
    { name: "Pomona Courthouse South", address: "400 Civic Center Plaza", city: "Pomona", zip: "91766" },
    { name: "Santa Monica Courthouse", address: "1725 Main St", city: "Santa Monica", zip: "90401" },
    { name: "Torrance Courthouse", address: "825 Maple Ave", city: "Torrance", zip: "90503" },
    { name: "Van Nuys Courthouse East", address: "6230 Sylmar Ave", city: "Van Nuys", zip: "91401" },
  ],
  "Madera": [
    { name: "Madera County Superior Court", address: "209 W Yosemite Ave", city: "Madera", zip: "93637" },
  ],
  "Marin": [
    { name: "Marin County Superior Court", address: "3501 Civic Center Dr", city: "San Rafael", zip: "94903" },
  ],
  "Mariposa": [
    { name: "Mariposa County Superior Court", address: "5088 Bullion St", city: "Mariposa", zip: "95338" },
  ],
  "Mendocino": [
    { name: "Mendocino County Superior Court", address: "100 N State St", city: "Ukiah", zip: "95482" },
  ],
  "Merced": [
    { name: "Merced County Superior Court", address: "2260 N St", city: "Merced", zip: "95340" },
  ],
  "Modoc": [
    { name: "Modoc County Superior Court", address: "205 S East St", city: "Alturas", zip: "96101" },
  ],
  "Mono": [
    { name: "Mono County Superior Court", address: "100 Thompsons Way", city: "Mammoth Lakes", zip: "93546" },
  ],
  "Monterey": [
    { name: "Monterey County Superior Court", address: "1200 Aguajito Rd", city: "Monterey", zip: "93940" },
  ],
  "Napa": [
    { name: "Napa County Superior Court", address: "1111 3rd St", city: "Napa", zip: "94559" },
  ],
  "Nevada": [
    { name: "Nevada County Superior Court", address: "201 Church St", city: "Nevada City", zip: "95959" },
  ],
  "Orange": [
    { name: "Central Justice Center", address: "700 Civic Center Dr W", city: "Santa Ana", zip: "92701" },
    { name: "Harbor Justice Center", address: "4601 Jamboree Rd", city: "Newport Beach", zip: "92660" },
    { name: "North Justice Center", address: "1275 N Berkeley Ave", city: "Fullerton", zip: "92832" },
    { name: "West Justice Center", address: "8141 13th St", city: "Westminster", zip: "92683" },
  ],
  "Placer": [
    { name: "Placer County Superior Court", address: "10820 Justice Center Dr", city: "Roseville", zip: "95678" },
  ],
  "Plumas": [
    { name: "Plumas County Superior Court", address: "520 Main St", city: "Quincy", zip: "95971" },
  ],
  "Riverside": [
    { name: "Riverside Historic Courthouse", address: "4050 Main St", city: "Riverside", zip: "92501" },
    { name: "Southwest Justice Center", address: "30755-D Auld Rd", city: "Murrieta", zip: "92563" },
    { name: "Palm Springs Courthouse", address: "3255 E Tahquitz Canyon Way", city: "Palm Springs", zip: "92262" },
  ],
  "Sacramento": [
    { name: "Carol Miller Justice Center", address: "301 Bicentennial Cir", city: "Sacramento", zip: "95826" },
    { name: "Gordon D. Schaber Courthouse", address: "720 9th St", city: "Sacramento", zip: "95814" },
  ],
  "San Benito": [
    { name: "San Benito County Superior Court", address: "440 5th St", city: "Hollister", zip: "95023" },
  ],
  "San Bernardino": [
    { name: "San Bernardino Justice Center", address: "247 W Third St", city: "San Bernardino", zip: "92415" },
    { name: "Rancho Cucamonga Courthouse", address: "8303 Haven Ave", city: "Rancho Cucamonga", zip: "91730" },
    { name: "Victorville Courthouse", address: "14455 Civic Dr", city: "Victorville", zip: "92392" },
  ],
  "San Diego": [
    { name: "Hall of Justice", address: "330 W Broadway", city: "San Diego", zip: "92101" },
    { name: "North County Division", address: "325 S Melrose Dr", city: "Vista", zip: "92081" },
    { name: "South County Division — Chula Vista Courthouse", address: "500 3rd Ave", city: "Chula Vista", zip: "91910" },
    { name: "East County Division", address: "250 E Main St", city: "El Cajon", zip: "92020" },
  ],
  "San Francisco": [
    { name: "Civic Center Courthouse", address: "400 McAllister St", city: "San Francisco", zip: "94102" },
  ],
  "San Joaquin": [
    { name: "San Joaquin County Superior Court", address: "222 E Weber Ave", city: "Stockton", zip: "95202" },
  ],
  "San Luis Obispo": [
    { name: "San Luis Obispo County Superior Court", address: "1035 Palm St", city: "San Luis Obispo", zip: "93408" },
  ],
  "San Mateo": [
    { name: "San Mateo County Superior Court", address: "400 County Center", city: "Redwood City", zip: "94063" },
  ],
  "Santa Barbara": [
    { name: "Santa Barbara County Superior Court", address: "1100 Anacapa St", city: "Santa Barbara", zip: "93101" },
    { name: "Santa Maria Division", address: "312-C E Cook St", city: "Santa Maria", zip: "93454" },
  ],
  "Santa Clara": [
    { name: "Downtown Superior Court", address: "191 N 1st St", city: "San Jose", zip: "95113" },
  ],
  "Santa Cruz": [
    { name: "Santa Cruz County Superior Court", address: "701 Ocean St", city: "Santa Cruz", zip: "95060" },
  ],
  "Shasta": [
    { name: "Shasta County Superior Court", address: "1500 Court St", city: "Redding", zip: "96001" },
  ],
  "Sierra": [
    { name: "Sierra County Superior Court", address: "100 Courthouse Sq", city: "Downieville", zip: "95936" },
  ],
  "Siskiyou": [
    { name: "Siskiyou County Superior Court", address: "311 4th St", city: "Yreka", zip: "96097" },
  ],
  "Solano": [
    { name: "Solano County Superior Court", address: "600 Union Ave", city: "Fairfield", zip: "94533" },
  ],
  "Sonoma": [
    { name: "Sonoma County Superior Court", address: "600 Administration Dr", city: "Santa Rosa", zip: "95403" },
  ],
  "Stanislaus": [
    { name: "Stanislaus County Superior Court", address: "800 11th St", city: "Modesto", zip: "95354" },
  ],
  "Sutter": [
    { name: "Sutter County Superior Court", address: "1175 Civic Center Blvd", city: "Yuba City", zip: "95993" },
  ],
  "Tehama": [
    { name: "Tehama County Superior Court", address: "1740 Walnut St", city: "Red Bluff", zip: "96080" },
  ],
  "Trinity": [
    { name: "Trinity County Superior Court", address: "11 Court St", city: "Weaverville", zip: "96093" },
  ],
  "Tulare": [
    { name: "Tulare County Superior Court", address: "221 S Mooney Blvd", city: "Visalia", zip: "93291" },
  ],
  "Tuolumne": [
    { name: "Tuolumne County Superior Court", address: "41 W Yaney Ave", city: "Sonora", zip: "95370" },
  ],
  "Ventura": [
    { name: "Ventura County Superior Court", address: "800 S Victoria Ave", city: "Ventura", zip: "93009" },
  ],
  "Yolo": [
    { name: "Yolo County Superior Court", address: "1000 Main St", city: "Woodland", zip: "95695" },
  ],
  "Yuba": [
    { name: "Yuba County Superior Court", address: "215 5th St", city: "Marysville", zip: "95901" },
  ],
};
