let packages = JSON.parse(localStorage.getItem("packages")) || [];

/* ---------------- ADMIN SIDE ---------------- */

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

  div.querySelector(".remove-row-btn").addEventListener("click", () => {
    container.removeChild(div);
  });

  container.appendChild(div);
}

function updateAdminTable() {
  const tbody = document.getElementById("packagesBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  packages.forEach((pkg, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${pkg.firstName} ${pkg.lastName}</td>
      <td>${pkg.email}</td>
      <td>${pkg.carrier}</td>
      <td>${pkg.shipper}</td>
      <td>${pkg.arrivalTime}</td>
      <td>${pkg.pickedUp ? "Picked Up" : "Waiting"}</td>
      <td>${pkg.pickupTime || ""}</td>
      <td>${pkg.signature || ""}</td>
      <td><button class="delete-table-btn">Delete</button></td>
    `;

    tr.querySelector(".delete-table-btn").addEventListener("click", () => {
      const ok = confirm(
        `Delete package for ${pkg.firstName} ${pkg.lastName}?`
      );

      if (!ok) return;

      packages.splice(index, 1);
      localStorage.setItem("packages", JSON.stringify(packages));
      updateAdminTable();
    });

    tbody.appendChild(tr);
  });
}

const packageForm = document.getElementById("packageForm");
if (packageForm) {
  packageForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();

    const packageRows = document.querySelectorAll(".packageRow");

    if (packageRows.length === 0) {
      alert("Add at least one package first.");
      return;
    }

    let previewMessage = `You are about to log packages for:\n\n`;
    previewMessage += `Name ${firstName} ${lastName}\n`;
    previewMessage += `Email ${email}\n`;
    previewMessage += `Number of packages ${packageRows.length}\n\n`;
    previewMessage += "Carriers entered\n";

    packageRows.forEach((row, i) => {
      const carrier = row.querySelector(".carrier").value.trim();
      const shipper = row.querySelector(".shipper").value.trim();
      previewMessage += `${i + 1}. ${carrier}, ${shipper}\n`;
    });

    previewMessage += "\nLog these packages?";

    if (!confirm(previewMessage)) {
      return;
    }

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
    document.getElementById("packagesContainer").innerHTML = "";
    updateAdminTable();
  });
}

function resetPackages() {
  if (!confirm("Are you sure you want to delete all packages?")) return;

  packages = [];
  localStorage.setItem("packages", JSON.stringify(packages));
  updateAdminTable();
}

/* ---------------- RECIPIENT SIDE ---------------- */

function searchPackages() {
  const lastNameInput = document.getElementById("searchLastName");
  const resultsDiv = document.getElementById("results");
  if (!lastNameInput || !resultsDiv) return;

  const lastName = lastNameInput.value.trim().toLowerCase();
  resultsDiv.innerHTML = "";

  if (!lastName) return;

  const matches = packages.filter(
    p => p.lastName.toLowerCase() === lastName && !p.pickedUp
  );

  if (matches.length === 0) {
    resultsDiv.innerHTML = "<p>No packages found.</p>";
    return;
  }

  matches.forEach(pkg => {
    const div = document.createElement("div");

    const info = document.createElement("p");
    info.innerHTML =
      `<strong>${pkg.firstName} ${pkg.lastName}</strong> ` +
      `Carrier ${pkg.carrier} Shipper ${pkg.shipper} Arrived ${pkg.arrivalTime}`;

    const btn = document.createElement("button");
    btn.textContent = "Sign for pickup";
    btn.addEventListener("click", () => signPackageById(pkg.id));

    div.appendChild(info);
    div.appendChild(btn);
    resultsDiv.appendChild(div);
  });
}

function signPackageById(id) {
  const index = packages.findIndex(p => p.id === id);
  if (index === -1) return;

  const name = prompt("Type your full name to sign for the package");

  if (!name) return;

  packages[index].pickedUp = true;
  packages[index].signature = name;
  packages[index].pickupTime = new Date().toLocaleString();

  localStorage.setItem("packages", JSON.stringify(packages));

  alert("Package signed out successfully");

  const resultsDiv = document.getElementById("results");
  const searchBox = document.getElementById("searchLastName");

  if (resultsDiv) resultsDiv.innerHTML = "";
  if (searchBox) searchBox.value = "";

  updateAdminTable();
}

/* ---------------- LOAD PAGE ---------------- */

updateAdminTable();
