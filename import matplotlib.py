import matplotlib.pyplot as plt

# Each entry in this list is a dictionary with:
# - 'name': A label for the milestone or civilization
# - 'date': The approximate year (BC as a positive integer, AD as negative or zero)
# - 'offset': How far above/below the timeline the label should appear
# - 'desc': (Optional) a short note describing its relevance to geometry or "4D" research

events = [
    # -- Ancient Civilizations --
    {"name": "Sumerian Civilization (Mesopotamia)", "date": 3500, "offset": 0.5,
     "desc": "Earliest known written records; foundations of math & astronomy"},
    {"name": "Indus Valley Civilization", "date": 3300, "offset": -0.5,
     "desc": "Urban planning & standardized measurements"},
    {"name": "Elamite Civilization", "date": 3200, "offset": 0.5,
     "desc": "Among the earliest recorded cultures in the region of Iran"},
    {"name": "Ancient Egypt (Early Dynastic)", "date": 3100, "offset": -0.5,
     "desc": "Hieroglyphic writing & geometry for architecture, surveying"},
    {"name": "Akkadian Empire", "date": 2334, "offset": 0.6,
     "desc": "Influential in Mesopotamian mathematics & astronomy"},
    {"name": "Hittite Civilization", "date": 2000, "offset": -0.5,
     "desc": "Developed in Anatolia, known from cuneiform & law codes"},
    
    # -- Later Ancient & Classical Math/Geometry --
    {"name": "Babylonian Math Texts", "date": 1800, "offset": 0.5,
     "desc": "Advanced algebraic problems (e.g. Plimpton 322)"},
    {"name": "Greek Geometry (Thales, Pythagoras)", "date": 600, "offset": -0.5,
     "desc": "Earliest formal proofs, introduction of geometric fundamentals"},
    {"name": "Euclid's Elements", "date": 300, "offset": 0.5,
     "desc": "Systematic axiomatic geometry that influenced math for centuries"},
    
    # -- Medieval & Early Modern Advances --
    {"name": "Al-Khwarizmi & Algebra", "date": -800, "offset": -0.5,
     "desc": "Foundations of algebra & algorithmic thinking (Baghdad)"},
    {"name": "Descartes' Coordinate Geometry", "date": -1637, "offset": 0.5,
     "desc": "Bridged algebra & geometry, setting stage for higher dimensions"},
    
    # -- Modern Geometry & The 4th Dimension --
    {"name": "Riemann's Non-Euclidean Geometry", "date": -1854, "offset": -0.5,
     "desc": "Opened door to curved space & higher-dimensional geometry"},
    {"name": "Minkowski’s 4D Spacetime", "date": -1908, "offset": 0.6,
     "desc": "Unified space & time into a 4D continuum for relativity"},
    
    # -- Contemporary 4D Topics --
    {"name": "4D Printing & Research Concepts", "date": -2013, "offset": -0.5,
     "desc": "Smart materials that adapt over time, bridging geometry & time"},
    {"name": "4D Research Labs (Fictional or Future)", "date": -2025, "offset": 0.5,
     "desc": "Hypothetical or conceptual labs pushing 4D geometry & physics"}
]

# -----------------------------------------------------------------------------
# Helper function to convert BC dates to a negative scale for plotting.
#   - Positive values = BC (e.g., 3500 BC -> +3500)
#   - Negative values = AD (e.g., 2025 AD -> -2025)
# For a single timeline axis, we can invert the sign so that older events
# (bigger BC numbers) appear on the left, and more recent (AD) on the right.
# -----------------------------------------------------------------------------
def convert_year_bc_ad_to_numeric(year_bc):
    """
    We’ll treat BC as positive numbers, AD as negative.
    If the event is BC (like 3500 BC), it remains positive for now.
    If the event is AD (like 2025 AD), we store it as negative.
    Then we’ll invert the axis for display.
    """
    # If the year is negative, we assume it's AD
    # If the year is positive, we assume it's BC
    return -year_bc  # invert sign so bigger BC is more negative -> to the left

# Convert each event's date to a numeric scale
for event in events:
    event["numeric_date"] = convert_year_bc_ad_to_numeric(event["date"])

# Determine min/max for the x-axis
min_date = min(e["numeric_date"] for e in events)
max_date = max(e["numeric_date"] for e in events)

fig, ax = plt.subplots(figsize=(14, 5))

# Draw a central horizontal line (our timeline)
ax.hlines(y=0, xmin=min_date, xmax=max_date, color='gray', linewidth=2)

# Plot each event
for e in events:
    x_val = e["numeric_date"]
    y_offset = e["offset"]
    
    # Plot the marker
    ax.plot(x_val, 0, 'o', color='steelblue', markersize=8)
    
    # Dashed line from timeline to the label
    ax.vlines(x=x_val, ymin=0, ymax=y_offset, color='steelblue',
              linewidth=1, linestyles='dashed')
    
    # Label with name + approximate date
    date_label = f"{e['date']} BC" if e['date'] > 0 else f"{-e['date']} AD"
    label_text = f"{e['name']}\n({date_label})"
    
    # Optionally include a short descriptor about 4D or geometry
    if "desc" in e and e["desc"]:
        label_text += f"\n{e['desc']}"
    
    ax.text(
        x_val, 
        y_offset + (0.1 if y_offset > 0 else -0.1),
        label_text,
        ha='center',
        va='bottom' if y_offset > 0 else 'top',
        fontsize=9,
        bbox=dict(boxstyle="round,pad=0.3", facecolor="lightyellow",
                  edgecolor="gray", alpha=0.7)
    )

ax.set_title("Extended Timeline: Ancient Civilizations to 4D Research", fontsize=14, pad=20)
ax.set_xlabel("← Older Dates (BC)      |      More Recent (AD) →", fontsize=11)

# Remove y-axis for clarity
ax.get_yaxis().set_visible(False)

# Add gridlines for the x-axis
ax.xaxis.grid(True, linestyle='--', alpha=0.5)

# Expand the left/right margins slightly
plt.xlim(min_date - 100, max_date + 100)

plt.tight_layout()
plt.show()
