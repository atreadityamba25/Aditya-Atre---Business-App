
/* =====================================================
   SKYBRIDGE AIR CARGO
   Main JavaScript
   Features: Shipment Tracking, Price Calculator, Enquiry
   ===================================================== */


/* =====================================================
   1. DEMO SHIPMENT DATABASE
   ===================================================== */

const shipments = {
    SBC1025: {
        origin: "Mumbai",
        destination: "Delhi",
        status: "In Transit",
        location: "Mumbai Air Cargo Terminal",
        eta: "Today, 8:30 PM"
    },

    SBC2048: {
        origin: "Bengaluru",
        destination: "Hyderabad",
        status: "Delivered",
        location: "Hyderabad Distribution Centre",
        eta: "Delivered"
    },

    SBC3012: {
        origin: "Delhi",
        destination: "Chennai",
        status: "Delayed",
        location: "Delhi Cargo Terminal",
        eta: "Tomorrow, 11:00 AM"
    },

    SBC4176: {
        origin: "Pune",
        destination: "Bengaluru",
        status: "Out for Delivery",
        location: "Bengaluru Distribution Hub",
        eta: "Today, 6:00 PM"
    },

    SBC5289: {
        origin: "Hyderabad",
        destination: "Mumbai",
        status: "Cancelled",
        location: "Hyderabad Cargo Terminal",
        eta: "Shipment Cancelled"
    }
};


/* =====================================================
   2. SHIPMENT TRACKING
   ===================================================== */

function trackShipment(shipmentId, resultElement) {
    if (!resultElement) return;

    const id = shipmentId.trim().toUpperCase();

    if (!id) {
        resultElement.textContent = "Please enter a shipment ID.";
        return;
    }

    const shipment = shipments[id];

    if (!shipment) {
        resultElement.textContent =
            `${id} was not found. Try SBC1025, SBC2048, SBC3012, SBC4176 or SBC5289.`;
        return;
    }

    resultElement.innerHTML = `
        <div class="result-grid">

            <div class="result-item">
                <span>Shipment ID</span>
                <strong>${id}</strong>
            </div>

            <div class="result-item">
                <span>Status</span>
                <strong>${shipment.status}</strong>
            </div>

            <div class="result-item">
                <span>Origin</span>
                <strong>${shipment.origin}</strong>
            </div>

            <div class="result-item">
                <span>Destination</span>
                <strong>${shipment.destination}</strong>
            </div>

            <div class="result-item">
                <span>Current Location</span>
                <strong>${shipment.location}</strong>
            </div>

            <div class="result-item">
                <span>Expected Delivery</span>
                <strong>${shipment.eta}</strong>
            </div>

        </div>
    `;
}


// Main shipment tracking form
const trackingForm = document.getElementById("trackingForm");

if (trackingForm) {
    trackingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const input = document.getElementById("awb");
        const result = document.getElementById("trackingResult");

        if (input && result) {
            trackShipment(input.value, result);
        }
    });
}


// Quick tracking form on the homepage
const quickTrackForm = document.getElementById("quickTrackForm");

if (quickTrackForm) {
    quickTrackForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const input =
            document.getElementById("quickTrackingId") ||
            document.getElementById("quickAwb") ||
            quickTrackForm.querySelector('input');

        const result =
            document.getElementById("quickTrackingResult") ||
            document.getElementById("quickTrackResult");

        if (input && result) {
            trackShipment(input.value, result);
        } else if (input) {
            // If there is no separate quick result area,
            // send the user to the main tracking section.
            const mainInput = document.getElementById("awb");

            if (mainInput) {
                mainInput.value = input.value;
                document.getElementById("trackingForm")?.requestSubmit();
                document.getElementById("tracking")?.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }
    });
}


// Clickable demo shipment IDs
document.querySelectorAll(".demo-id").forEach(function (button) {
    button.addEventListener("click", function () {
        const id = button.dataset.id;

        const input = document.getElementById("awb");
        const result = document.getElementById("trackingResult");

        if (input) input.value = id;

        if (result) {
            trackShipment(id, result);
        } else {
            document.getElementById("trackingForm")?.requestSubmit();
        }
    });
});


/* =====================================================
   3. AIR CARGO PRICE CALCULATOR
   ===================================================== */

// Approximate airport coordinates for supported cities
const airports = {
    Mumbai: {
        lat: 19.0896,
        lon: 72.8656
    },

    Delhi: {
        lat: 28.5562,
        lon: 77.1000
    },

    Bengaluru: {
        lat: 13.1986,
        lon: 77.7066
    },

    Chennai: {
        lat: 12.9941,
        lon: 80.1709
    },

    Hyderabad: {
        lat: 17.2403,
        lon: 78.4294
    },

    Pune: {
        lat: 18.5822,
        lon: 73.9197
    },

    Kolkata: {
        lat: 22.6547,
        lon: 88.4467
    },

    Ahmedabad: {
        lat: 23.0772,
        lon: 72.6347
    }
};


// Calculate approximate distance using the Haversine formula
function getDistance(origin, destination) {
    const pointA = airports[origin];
    const pointB = airports[destination];

    if (!pointA || !pointB) return null;

    const toRadians = function (degrees) {
        return degrees * Math.PI / 180;
    };

    const lat1 = toRadians(pointA.lat);
    const lat2 = toRadians(pointB.lat);

    const differenceLat = toRadians(pointB.lat - pointA.lat);
    const differenceLon = toRadians(pointB.lon - pointA.lon);

    const a =
        Math.sin(differenceLat / 2) ** 2 +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(differenceLon / 2) ** 2;

    const safeA = Math.min(1, Math.max(0, a));

    return 6371 * 2 * Math.atan2(
        Math.sqrt(safeA),
        Math.sqrt(1 - safeA)
    );
}


// Price calculator form
const estimateForm = document.getElementById("estimateForm");

if (estimateForm) {
    estimateForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const origin = document.getElementById("origin")?.value;
        const destination = document.getElementById("destination")?.value;
        const weight = Number(document.getElementById("weight")?.value);
        const service = document.getElementById("service")?.value;

        const output = document.getElementById("estimateResult");

        if (!output) {
            console.error("Could not find the estimateResult element in HTML.");
            return;
        }

        // Validate the selected cities
        if (!airports[origin] || !airports[destination]) {
            output.textContent =
                "Please select a valid origin and destination.";
            return;
        }

        if (origin === destination) {
            output.textContent =
                "Origin and destination must be different cities.";
            return;
        }

        // Validate weight
        if (!Number.isFinite(weight) || weight <= 0) {
            output.textContent =
                "Please enter a valid shipment weight greater than zero.";
            return;
        }

        // Calculate approximate route distance
        const distance = getDistance(origin, destination);

        // Illustrative pricing assumptions for the student demo
        const isExpress = service === "express";

        const ratePerKg = isExpress ? 220 : 150;
        const minimumCharge = isExpress ? 900 : 650;

        // Longer routes have a higher distance adjustment
        const distanceMultiplier =
            1 + (distance / 1500) * 0.35;

        // Calculate freight, applying the minimum charge
        const calculatedFreight =
            weight * ratePerKg * distanceMultiplier;

        const freight = Math.max(
            minimumCharge,
            calculatedFreight
        );

        // Illustrative 12% handling and fuel surcharge
        const surcharge = freight * 0.12;

        // Round the final amount to the nearest rupee
        const total = Math.round(freight + surcharge);

        // Format amounts in Indian currency style
        const formatRupees = function (amount) {
            return "₹" + Math.round(amount).toLocaleString("en-IN");
        };

        // Display the estimate
        output.innerHTML = `
            <div class="estimate-details">

                <h3>Air Cargo Cost Estimate</h3>

                <p>
                    <strong>Origin:</strong> ${origin}
                </p>

                <p>
                    <strong>Destination:</strong> ${destination}
                </p>

                <p>
                    <strong>Approximate Air Distance:</strong>
                    ${Math.round(distance).toLocaleString("en-IN")} km
                </p>

                <p>
                    <strong>Chargeable Weight:</strong> ${weight} kg
                </p>

                <p>
                    <strong>Service:</strong>
                    ${isExpress ? "Express Cargo" : "Standard Air Freight"}
                </p>

                <p>
                    <strong>Base Rate:</strong>
                    ${formatRupees(ratePerKg)} per kg
                </p>

                <p>
                    <strong>Estimated Freight:</strong>
                    ${formatRupees(freight)}
                </p>

                <p>
                    <strong>Handling/Fuel Surcharge (12%):</strong>
                    ${formatRupees(surcharge)}
                </p>

                <h3>Estimated Total: ${formatRupees(total)}</h3>

                <small>
                    This is an illustrative estimate for demonstration.
                    Actual charges may vary with volumetric weight,
                    carrier rates, handling, fuel charges and taxes.
                </small>

            </div>
        `;
    });
}


/* =====================================================
   4. ENQUIRY FORM
   ===================================================== */

// Supports either enquiryForm or contactForm
const enquiryForm =
    document.getElementById("enquiryForm") ||
    document.getElementById("contactForm");

if (enquiryForm) {
    enquiryForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const message =
            document.getElementById("enquiryMessage") ||
            document.getElementById("formMessage");

        if (message) {
            message.textContent =
                "Thank you for your enquiry! Your demo submission has been received.";
            message.style.display = "block";
        } else {
            alert(
                "Thank you for your enquiry! Your demo submission has been received."
            );
        }

        enquiryForm.reset();
    });
}
