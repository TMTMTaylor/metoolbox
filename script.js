// ----------------- Initialization -----------------
let packages = JSON.parse(localStorage.getItem("packages")) || [];

// ----------------- Admin Functions -----------------
function addPackageRow() {
  const container = document.getElementById("packagesContainer");
  if (!container) return;

  const div = document.createElement("div");
  div.classList.add("packageRow");
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.gap = "10px";
  div.innerHTML = `
    <label>Carrier:</label>
    <input type="text" class="carrier" required>
    <label>Shipper:</label>
    <input type="text" class="shipper" required>
    <button type="button" class="remove-row-btn">Remove</button>
  `;

  // Remove row functionality
  div.querySelector(".remove-row-btn").addEventListener("click", () => {
    container.removeChild(div);
  });

  container.appendChild(div);
}

function updateAdminTable() {
  const tbody = document.getElementById("packagesBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  packages.forEach(pkg => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${pkg.firstName} ${pkg.lastName}</td>
      <td>${pkg.email}</td>
      <td>${pkg.carrier}</td>
      <td>${pkg.shipper}</td>
      <td>${pkg.arrivalTime}</td>
      <td>${pkg.pickedUp ? "Picked Up" : "Waiting"}</td>
      <td>${pkg.pickupTime || "-"}</td>
      <td>${pkg.signature || "-"}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Admin form submission
const packageForm = document.getElementById("packageForm");
if (packageForm) {
  packageForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();

    const packageRows = document.querySelectorAll(".packageRow");
    const newPackages = [];

    packageRows.forEach(row => {
      const carrier = row.querySelector(".carrier").value.trim();
      const shipper = row.querySelector(".shipper").value.trim();

      newPackages.push({
        id: (Date.now() + Math.random()).toString(),
        firstName,
        lastName,
        email,
        carrier,
        shipper,
        arrivalTime: new Date().toLocaleString(),
        pickedUp: false,
        pickupTime: null,
        signature: null
      });
    });

    packages = packages.concat(newPackages);
    localStorage.setItem("packages", JSON.stringify(packages));

    alert(`Logged ${newPackages.length} package(s) for ${firstName} ${lastName}`);

    packageForm.reset();
    document.getElementById("packagesContainer").innerHTML = `<h3>Packages</h3>`;
    updateAdminTable();
  });
}

// Reset all packages
function resetPackages() {
  if (!confirm("Are you sure you want to delete all packages?")) return;

  packages = [];
  localStorage.setItem("packages", JSON.stringify(packages));
  updateAdminTable();
  alert("All packages have been reset.");
}

// ----------------- Recipient/Kiosk Functions -----------------
function searchPackages() {
  const lastNameInput = document.getElementById("searchLastName");
  const resultsDiv = document.getElementById("results");
  if (!lastNameInput || !resultsDiv) return;

  const lastName = lastNameInput.value.trim().toLowerCase();
  resultsDiv.innerHTML = "";

  if (!lastName) return;

  const matches = packages.filter(pkg => pkg.lastName.toLowerCase() === lastName && !pkg.pickedUp);

  if (matches.length === 0) {
    resultsDiv.innerHTML = "<p>No packages found.</p>";
    return;
  }

  matches.forEach(pkg => {
    const div = document.createElement("div");

    const info = document.createElement("p");
    info.innerHTML = `<strong>${pkg.firstName} ${pkg.lastName}</strong> - Carrier: ${pkg.carrier}, Shipper: ${pkg.shipper}, Arrived: ${pkg.arrivalTime}`;
    div.appendChild(info);

    const btn = document.createElement("button");
    btn.textContent = "Sign for pickup";
    btn.addEventListener("click", () => signPackageById(pkg.id));
    div.appendChild(btn);

    resultsDiv.appendChild(div);
  });
}

function signPackageById(id) {
  const pkgIndex = packages.findIndex(p => p.id === id);
  if (pkgIndex === -1) return;

  const signerName = prompt("Please enter your full name to sign:");
  if (!signerName) return;

  packages[pkgIndex].pickedUp = true;
  packages[pkgIndex].signature = signerName;
  packages[pkgIndex].pickupTime = new Date().toLocaleString();

  localStorage.setItem("packages", JSON.stringify(packages));
  alert("Package signed out successfully!");

  document.getElementById("results").innerHTML = "";
  document.getElementById("searchLastName").value = "";

  updateAdminTable();
}

// ----------------- Initial Load -----------------
updateAdminTable();
