"""Generate the résumé PDF from the 2026-10-14 résumé supplied for the portfolio.
The published PDF is regenerated from the updated one-page résumé text;
the original binary upload is not retained here. Do not alter claims, numbers or dates.
"""
from pathlib import Path
import sys
import fitz

ROOT=Path(__file__).resolve().parents[1]
# Both historic PDF asset paths now publish the same current résumé so no stale alternate remains.
FULL_DETAIL="--full-detail" in sys.argv
DEST=ROOT / "assets" / (
    "Kailani_Alarcon_Resume_Full_Detail.pdf" if FULL_DETAIL
    else "Kailani_Alarcon_Resume.pdf"
)
OPTIONAL_DETAIL=set()
REGULAR=Path("/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf")
BOLD=Path("/usr/share/fonts/truetype/crosextra/Carlito-Bold.ttf")
if not REGULAR.exists() or not BOLD.exists():
    raise SystemExit("Required Carlito fonts unavailable; install fonts-crosextra-carlito.")
SPANS=[[244.73,51.24,1,"KAILANI ALARCON"],[115.22,68.04,0,"775-432-9365 | kailanip.alarcon@gmail.com | LinkedIn: kailani-alarcon | GitHub: EngrKailani"],[36,82.1,1,"EDUCATION"],[39.6,98.18,1,"University of Nevada, Reno | Reno, NV"],[72.02,112.22,0,"M.S. Electrical Engineering | Expected May 2028"],[72.02,126.26,0,"B.S. Electrical Engineering, Minor in Mathematics | 2026"],[36,140.3,1,"Focus:"],[64.58,140.3,0,"Robotics, Autonomous Vehicles, and Embedded Systems (RAVES) | Honors Baccalaureate"],[36,154.34,1,"Coursework:"],[88.7,154.34,0," Control Systems I & II, Robotics, Embedded Systems, Digital Signal Processing, Microprocessor Applications"],[36,168.38,1,"TECHNICAL SKILLS"],[36,184.34,1,"Systems & Analysis:"],[118.34,184.34,0," Requirements development, verification planning, risk assessment, BOM development"],[36,198.38,1,"Embedded & Controls:"],[129.86,198.38,0," ROS, STM32, UART, SPI, I2C, PWM, interrupts, encoder capture, sensor integration, PID"],[36,212.42,1,"Programming & Tools:"],[128.78,212.42,0," C, C++, Python, MATLAB, Simulink, Creo, Thermal Desktop, Arduino, Git, STM32CubeIDE"],[36,226.46,1,"Hardware:"],[79.94,226.46,0," Oscilloscopes, DMMs, FPGA/VHDL, VNA/S-parameters, SOLT calibration, FFT, thermal/photometric validation"],[36,240.5,1,"EXPERIENCE"],[39.6,256.61,1,"OSTEM Intern, Human Factors Engineering and Mechanical Design | NASA"],[483.7,256.61,0,"Aug. 2026 - Dec. 2026"],[39.6,270.65,1,"Marshall Space Flight Center | Huntsville, AL"],[39.6,284.69,0,"• Evaluated a legacy robotic arm for lunar-dust testing in a high-vacuum chamber, using Python and a Linux development"],[47.52,298.73,0,"environment to characterize geometry, mass, actuator travel, workspace, and vacuum constraints."],[39.6,312.77,0,"• Converted 6 operational scenarios into 34 hierarchical system requirements covering manipulation, workspace, emergency"],[47.52,326.81,0,"shutdown, vacuum operation, and verification, incorporating ROS 2 and MuJoCo into robotic control and simulation"],[39.6,340.85,0,"• Performed load analysis using Creo mass properties, linkage geometry, and motor data shoulder load versus an actuator"],[47.52,354.89,0,"capability."],[39.6,368.93,1,"Product Development Intern"],[480.82,368.93,0,"Sept. 2023 - Aug. 2026"],[43.2,382.97,1,"LUX Dynamics | Reno, NV"],[39.6,397.01,0,"• Provided electrical, thermal, and photometric validation for 12+ LED products, generating performance data used to support"],[47.52,411.05,0,"manufacturing-release and engineering decisions."],[39.6,425.11,0,"• Managed 4–5 concurrent product-development projects and presented technical findings weekly to managers, customers, and"],[47.52,439.15,0,"engineers, supporting coordinated design and validation decisions."],[39.6,453.19,0,"• Improved thermal testing by developing an adopted validation procedure and Python/Arduino automation for acquisition,"],[47.52,467.23,0,"logging, ambient control, analysis, and reporting; documented results in 2 technical white papers."],[39.6,481.27,1,"Peer Tutor"],[483.7,481.27,0,"Aug. 2024 - May 2026"],[39.6,495.31,1,"Engineering Tutoring Center | University of Nevada, Reno"],[39.6,509.35,0,"• Supported 12–15 engineering students weekly across embedded C, microcontrollers, circuits, and real-time control by providing"],[47.52,523.39,0,"individualized technical instruction and problem-solving guidance."],[36,537.43,1,"SELECTED PROJECTS"],[39.6,553.39,1,"IVerify Capstone Project | Project and Systems Integration Lead"],[524.38,553.39,0,"Spring 2026"],[39.6,567.43,0,"• Led systems integration for a 4-person team developing a 5-subsystem non-invasive IV occlusion detector with 3-state"],[47.52,581.5,0,"classification, coordinating mechanical sensing, analog electronics, firmware, user indication, and verification planning."],[39.6,595.54,1,"Thermal Controller and Logger | Python, Arduino, TC-08"],[524.38,595.54,0,"2025 - 2026"],[39.6,609.58,0,"• Developed a unified thermal-test platform integrating TC-08 data logging, ambient control, live visualization, stability tracking,"],[47.52,623.62,0,"metadata capture, and automated Excel reporting to streamline test execution and analysis."],[39.6,637.66,1,"Fingerprint-Based Authentication | STM32F767ZI, UART"],[536.02,637.66,0,"Fall 2025"],[39.6,651.7,0,"• Built and validated an STM32 biometric authentication system supporting 24 fingerprint templates across 4 users and 2 UART"],[47.52,665.74,0,"channels operating at 57,600 and 115,200 baud."],[39.6,679.78,1,"Virtual Network Analyzer and SFCW | MATLAB, SOLT, S-Parameters"],[524.38,679.78,0,"Spring 2025"],[39.6,693.82,0,"• Developed MATLAB control and 12-term SOLT calibration for a 2-port VNA, automating S-parameter measurement, visualization,"],[47.52,707.86,0,"and exporting across 236 points from 100 MHz to 6 GHz."],[36,721.9,1,"LEADERSHIP, MEMBERSHIPS, AND HONORS"],[36,737.98,0,"Honors College Ambassador | IEEE | SWE | Presidential Scholarship | TC Energy Scholarship | Engineering Department & Electrical"],[36,752.04,0,"Engineering Outstanding Service Awards"]]
BLUE=(0.122,0.306,0.475)

pdf=fitz.open()
page=pdf.new_page(width=612,height=792)
page.insert_font(fontname="CarlitoRegular",fontfile=str(REGULAR))
page.insert_font(fontname="CarlitoBold",fontfile=str(BOLD))
# Keep the original single-line contact placement and one-page spacing.
SHIFT=0
for x,y,bold,text in SPANS:
    if not FULL_DETAIL and text.strip() in OPTIONAL_DETAIL:
        continue
    # The contact strip is drawn segment by segment below to embed real links.
    if text.startswith("775-432-9365 |"):
        continue
    original_y=y
    if original_y>51.24:
        y+=SHIFT
    size=15.96 if original_y==51.24 else 9.96
    heading=bold and x==36 and original_y in (82.10,168.38,240.50,537.43,721.90)
    color=BLUE if heading or original_y==51.24 else (0,0,0)
    page.insert_text((x,y),text,fontsize=size,
                     fontname="CarlitoBold" if bold else "CarlitoRegular",
                     color=color)
# Center a single-line contact bar with four genuinely clickable PDF links.
# The connected GitHub account is EngrKailani. Repositories under the historic
# kalarcon775 name redirect to EngrKailani.
CONTACT_PARTS=[
    ("775-432-9365",None),
    (" | ",None),
    ("kailanip.alarcon@gmail.com","mailto:kailanip.alarcon@gmail.com"),
    (" | ",None),
    ("LinkedIn: kailani-alarcon","https://www.linkedin.com/in/kailani-alarcon/"),
    (" | ",None),
    ("GitHub: EngrKailani","https://github.com/EngrKailani"),
]
regular_font=fitz.Font(fontfile=str(REGULAR))
contact_size=9.96
baseline=68.04+SHIFT
total_width=sum(regular_font.text_length(part,fontsize=contact_size)
                for part,_ in CONTACT_PARTS)
cursor=(612-total_width)/2
for label,target in CONTACT_PARTS:
    width=regular_font.text_length(label,fontsize=contact_size)
    linked=target is not None
    ink=BLUE if linked else (0,0,0)
    page.insert_text((cursor,baseline),label,fontsize=contact_size,
                     fontname="CarlitoRegular",color=ink)
    if linked:
        page.draw_line((cursor,baseline+0.5),(cursor+width,baseline+0.5),
                       color=BLUE,width=0.45)
        page.insert_link({"kind":fitz.LINK_URI,
                          "from":fitz.Rect(cursor,baseline-10,cursor+width,baseline+2),
                          "uri":target})
    cursor+=width
for y in (87.50,173.66,245.93,542.71,727.30):
    page.draw_rect(fitz.Rect(34.56,y+SHIFT,577.54,y+SHIFT+0.96),
                   fill=BLUE,color=None,overlay=True)

pdf.set_metadata({"title":"Kailani Alarcon Engineering Resume",
                  "author":"Kailani Alarcon",
                  "subject":"Engineering résumé - full application details" if FULL_DETAIL else "Private-sector engineering résumé"})
pdf.subset_fonts()
pdf.save(DEST,garbage=4,deflate=True)
check=fitz.open(DEST)
assert len(check)==1 and check[0].rect.width==612 and check[0].rect.height==792
assert "Aug. 2026 - Dec. 2026" in check[0].get_text()
link_targets={link.get("uri") for link in check[0].get_links()
              if link.get("kind")==fitz.LINK_URI}
required_links={target for _,target in CONTACT_PARTS if target}
assert required_links.issubset(link_targets), (
    "Missing contact links: "+repr(required_links-link_targets)
)
assert "GitHub: EngrKailani" in check[0].get_text()
assert "2 technical white papers" in check[0].get_text()
assert "3 technical white papers" not in check[0].get_text()

assert len(check[0].get_links())==3, "Expected exactly three embedded contact links"

text=check[0].get_text()

for value in ("Aug. 2026 - Dec. 2026","Performed load analysis using Creo mass properties",
              "34 hierarchical system requirements","12+ LED products","236 points",
              "57,600 and 115,200 baud"):
    assert value in text,value
for forbidden in ("Aug. 2026–Present","potential shoulder-actuator torque shortfall","GPA: 3.2 / 4.0"):
    assert forbidden not in text,forbidden
print("Updated",DEST,"size",DEST.stat().st_size,"bytes")
