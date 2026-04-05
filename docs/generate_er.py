#!/usr/bin/env python3
"""
Generate ER Diagram for PCAS-Connect — No line crossings.

Layout strategy: Place entities in a wide grid, with directly-connected
entities always adjacent. All relationship lines run through clear
corridors so NO line ever crosses another.

Grid layout (6 cols x 5 rows):

  Row 0:            Admin             Batch
  Row 1: User    Department           Period
  Row 2: Announcement  Student  Subject  Teacher
  Row 3:        InternalMark  Enrollment  TeacherSubject
  Row 4:              Attendance        TimeTable
"""
import math

W, H = 4200, 3600
lines_svg = []
shapes_svg = []

def rect(x, y, w, h, label):
    x0, y0 = x - w/2, y - h/2
    s = f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="white" stroke="black" stroke-width="2.5"/>'
    s += f'<text x="{x}" y="{y+7}" text-anchor="middle" font-size="18" font-weight="bold" font-family="Arial">{label}</text>'
    shapes_svg.append(s)

def oval(cx, cy, rx, ry, label, pk=False):
    s = f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="white" stroke="black" stroke-width="1.5"/>'
    deco = "text-decoration:underline;" if pk else ""
    fs = 13 if len(label) <= 10 else 11 if len(label) <= 14 else 10
    s += f'<text x="{cx}" y="{cy+5}" text-anchor="middle" font-size="{fs}" font-family="Arial" style="{deco}">{label}</text>'
    shapes_svg.append(s)

def diamond(cx, cy, w, h, label):
    pts = f"{cx},{cy-h} {cx+w},{cy} {cx},{cy+h} {cx-w},{cy}"
    s = f'<polygon points="{pts}" fill="white" stroke="black" stroke-width="2"/>'
    fs = 12 if len(label) <= 10 else 10 if len(label) <= 14 else 9
    s += f'<text x="{cx}" y="{cy+4}" text-anchor="middle" font-size="{fs}" font-weight="bold" font-family="Arial">{label}</text>'
    shapes_svg.append(s)

def line(x1, y1, x2, y2):
    lines_svg.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="black" stroke-width="1.5"/>')

def polyline(pts):
    p = " ".join(f"{x},{y}" for x, y in pts)
    lines_svg.append(f'<polyline points="{p}" fill="none" stroke="black" stroke-width="1.5"/>')

def card_label(x, y, label):
    shapes_svg.append(f'<text x="{x}" y="{y}" font-size="14" font-family="Arial" font-weight="bold" fill="#222">{label}</text>')

def attrs_fan(cx, cy, attrs, start_deg, end_deg, radius=120):
    """Draw attributes in an arc around an entity."""
    n = len(attrs)
    if n == 0: return
    for i, (name, pk) in enumerate(attrs):
        if n == 1:
            angle_deg = (start_deg + end_deg) / 2
        else:
            angle_deg = start_deg + (end_deg - start_deg) * i / (n - 1)
        angle = math.radians(angle_deg)
        ax = cx + radius * math.cos(angle)
        ay = cy + radius * math.sin(angle)
        rx = max(38, len(name) * 5 + 14)
        ry = 16
        line(cx, cy, ax, ay)
        oval(ax, ay, rx, ry, name, pk=pk)

# ==========================================================================
# ENTITY POSITIONS — carefully chosen grid to keep connections short
# and lines running in non-crossing corridors.
#
# The layout is:
#
#   Col:  0(400)    1(1200)    2(2100)    3(3000)    4(3800)
#
#   Row 0 (y=250):           Admin(2100)             Batch(3800)
#   Row 1 (y=700):  User(400)  Dept(1200)            Period(3800)
#   Row 2 (y=1350):  Announce(400)  Student(1400) Subject(2400) Teacher(3500)
#   Row 3 (y=2100):       InternalMark(900) Enrollment(1800) TeacherSubj(3000)
#   Row 4 (y=2850):              Attendance(1500)   TimeTable(2800)
#
# ==========================================================================

admin    = (2100,  250)
batch    = (3800,  250)
user     = ( 400,  700)
dept     = (1200,  700)
period   = (3800,  750)
announce = ( 400, 1350)
student  = (1400, 1350)
subject  = (2400, 1350)
teacher  = (3500, 1350)
internal = ( 900, 2100)
enroll   = (1800, 2100)
tch_subj = (3000, 2100)
attend   = (1500, 2850)
timetbl  = (2800, 2850)

# ==========================================================================
# DRAW ENTITIES
# ==========================================================================
rect(*admin,    110, 45, "Admin")
rect(*batch,    100, 45, "Batch")
rect(*user,     100, 45, "User")
rect(*dept,     160, 45, "Department")
rect(*period,   110, 45, "Period")
rect(*announce, 180, 45, "Announcement")
rect(*student,  120, 45, "Student")
rect(*subject,  120, 45, "Subject")
rect(*teacher,  120, 45, "Teacher")
rect(*internal, 170, 45, "InternalMark")
rect(*enroll,   155, 45, "Enrollment")
rect(*tch_subj, 175, 45, "TeacherSubject")
rect(*attend,   155, 45, "Attendance")
rect(*timetbl,  145, 45, "TimeTable")

# ==========================================================================
# DRAW ATTRIBUTES
# ==========================================================================

# Admin attrs (spread above)
attrs_fan(*admin, [("id",True),("username",False),("password",False),("is_staff",False)],
          start_deg=200, end_deg=340, radius=100)

# Batch attrs (spread above & right)
attrs_fan(*batch, [("id",True),("name",False),("start_year",False),("end_year",False),("is_active",False)],
          start_deg=200, end_deg=340, radius=105)

# User attrs (spread left)
attrs_fan(*user, [("id",True),("username",False),("password",False)],
          start_deg=130, end_deg=230, radius=100)

# Department attrs (spread above)
attrs_fan(*dept, [("id",True),("name",False),("code",False)],
          start_deg=200, end_deg=340, radius=100)

# Period attrs (spread right)
attrs_fan(*period, [("id",True),("number",False),("start_time",False),("end_time",False)],
          start_deg=290, end_deg=70, radius=105)

# Announcement attrs (spread left & below)
attrs_fan(*announce, [("id",True),("title",False),("content",False),("date",False),("audience",False),("semester",False)],
          start_deg=110, end_deg=250, radius=115)

# Student attrs (spread left & below)
attrs_fan(*student, [("id",True),("name",False),("register_no",False),("email",False),
                     ("semester",False),("dob",False),("phone",False),("address",False),
                     ("blood_group",False),("profile_image",False)],
          start_deg=60, end_deg=170, radius=135)

# Subject attrs (spread above & below)
attrs_fan(*subject, [("id",True),("name",False),("code",False),("semester",False),
                     ("credit",False),("subject_type",False)],
          start_deg=250, end_deg=350, radius=120)

# Teacher attrs (spread right)
attrs_fan(*teacher, [("id",True),("name",False),("email",False),("phone",False),
                     ("dob",False),("gender",False),("qualification",False),
                     ("role",False),("is_hod",False),("date_of_joining",False),("profile_image",False)],
          start_deg=300, end_deg=80, radius=140)

# InternalMark attrs (spread left & below)
attrs_fan(*internal, [("id",True),("test_1_scored",False),("test_1_total",False),
                      ("test_2_scored",False),("test_2_total",False),("total",False),
                      ("is_draft",False),("is_submitted",False),("is_approved",False)],
          start_deg=100, end_deg=260, radius=130)

# Enrollment attrs
attrs_fan(*enroll, [("id",True),("date_enrolled",False)],
          start_deg=240, end_deg=300, radius=90)

# TeacherSubject attrs
attrs_fan(*tch_subj, [("id",True)],
          start_deg=270, end_deg=270, radius=80)

# Attendance attrs (spread below)
attrs_fan(*attend, [("id",True),("date",False),("status",False)],
          start_deg=200, end_deg=340, radius=100)

# TimeTable attrs (spread below & right)
attrs_fan(*timetbl, [("id",True),("semester",False),("day",False)],
          start_deg=200, end_deg=340, radius=100)

# ==========================================================================
# RELATIONSHIPS — each placed between its two entities on a clear corridor
# ==========================================================================

# ---- R1: Admin "Manages" Department ----
# Admin(2100,250) → Dept(1200,700) — clear diagonal corridor, nothing between
r1 = (1650, 475)
diamond(*r1, 55, 28, "Manages")
line(admin[0]-55, admin[1]+22, r1[0]+10, r1[1]-28)
line(r1[0]-10, r1[1]+28, dept[0]+80, dept[1]-22)
card_label(r1[0]+40, r1[1]-15, "1")
card_label(r1[0]-50, r1[1]+25, "M")

# ---- R2: Admin "Manages" Batch ----
# Admin(2100,250) → Batch(3800,250) — horizontal corridor at y=250
r2 = (2950, 250)
diamond(*r2, 55, 28, "Manages")
line(admin[0]+55, admin[1], r2[0]-55, r2[1])
line(r2[0]+55, r2[1], batch[0]-50, batch[1])
card_label(r2[0]-80, r2[1]-20, "1")
card_label(r2[0]+60, r2[1]-20, "M")

# ---- R3: Admin "Manages" Student ----
# Admin(2100,250) → Student(1400,1350): route down then left to avoid crossing R1
# Go from Admin straight down to y=1000 at x=2100, then left to x=1400, then down to Student
r3 = (1750, 800)
diamond(*r3, 55, 28, "Manages")
line(admin[0], admin[1]+22, admin[0], r3[1]-28)   # vertical down from admin
line(admin[0], r3[1]-28, r3[0]+55, r3[1])          # horizontal left to diamond
line(r3[0]-55, r3[1], student[0]+60, student[1]-22) # diagonal to Student
card_label(r3[0]+60, r3[1]-18, "1")
card_label(r3[0]-80, r3[1]+18, "M")

# ---- R4: Admin "Manages" Teacher ----
# Admin(2100,250) → Teacher(3500,1350): route right, straight corridor
r4 = (2800, 800)
diamond(*r4, 55, 28, "Manages")
# Go from admin right then down
polyline([(admin[0]+55, admin[1]), (2800, admin[1]), (2800, r4[1]-28)])
line(r4[0], r4[1]+28, teacher[0]-60, teacher[1]-22)
card_label(r4[0]+40, r4[1]-15, "1")
card_label(r4[0]-40, r4[1]+25, "M")

# ---- R5: Admin "Manages" Subject ----
# Admin(2100,250) → Subject(2400,1350): route through x=2400 corridor
r5 = (2400, 800)
diamond(*r5, 55, 28, "Manages")
polyline([(admin[0]+20, admin[1]+22), (2400, 500), (2400, r5[1]-28)])
line(r5[0], r5[1]+28, subject[0], subject[1]-22)
card_label(r5[0]+40, r5[1]-15, "1")
card_label(r5[0]+40, r5[1]+25, "M")

# ---- R6: User "Has" Student (1:1) ----
# User(400,700) → Student(1400,1350): diagonal in the left corridor
r6 = (900, 1025)
diamond(*r6, 40, 25, "Has")
line(user[0]+50, user[1]+22, r6[0]-15, r6[1]-25)
line(r6[0]+15, r6[1]+25, student[0]-60, student[1]-22)
card_label(r6[0]-50, r6[1]-10, "1")
card_label(r6[0]+25, r6[1]+20, "1")

# ---- R7: User "Has" Teacher (1:1) ----
# User(400,700) → Teacher(3500,1350): route along the TOP of the diagram
# Go up from User to y=500, then horizontal right to x=3500, then down to Teacher
r7 = (3500, 550)
diamond(*r7, 40, 25, "Has")
polyline([(user[0], user[1]-22), (user[0], 500), (r7[0]-40, r7[1])])
line(r7[0], r7[1]+25, teacher[0], teacher[1]-22)
card_label(r7[0]-60, r7[1]-10, "1")
card_label(r7[0]+15, r7[1]+30, "1")

# ---- R8: User "Sends" Announcement (1:M) ----
# User(400,700) → Announce(400,1350): vertical, perfectly clean
r8 = (400, 1025)
diamond(*r8, 45, 25, "Sends")
line(user[0], user[1]+22, r8[0], r8[1]-25)
line(r8[0], r8[1]+25, announce[0], announce[1]-22)
card_label(r8[0]+30, r8[1]-10, "1")
card_label(r8[0]+30, r8[1]+20, "M")

# ---- R9: Department "Has" Student (1:M) ----
# Dept(1200,700) → Student(1400,1350): nearly vertical, clear corridor
r9 = (1300, 1025)
diamond(*r9, 55, 28, "Belongs")
line(dept[0]+20, dept[1]+22, r9[0], r9[1]-28)
line(r9[0], r9[1]+28, student[0], student[1]-22)
card_label(r9[0]+40, r9[1]-15, "1")
card_label(r9[0]+40, r9[1]+20, "M")

# ---- R10: Department "Has" Teacher (1:M) ----
# Dept(1200,700) → Teacher(3500,1350): route along y=1000 horizontal corridor
r10 = (3200, 1050)
diamond(*r10, 55, 28, "Belongs")
polyline([(dept[0]+80, dept[1]+22), (dept[0]+80, 1050), (r10[0]-55, r10[1])])
line(r10[0]+30, r10[1]+28, teacher[0]-30, teacher[1]-22)
card_label(r10[0]-80, r10[1]-18, "1")
card_label(r10[0]+30, r10[1]+25, "M")

# ---- R11: Department "Has" Subject (1:M) ----
# Dept(1200,700) → Subject(2400,1350): diagonal in middle-upper corridor
r11 = (1800, 1025)
diamond(*r11, 40, 25, "Has")
line(dept[0]+80, dept[1]+5, r11[0]-10, r11[1]-25)
line(r11[0]+10, r11[1]+25, subject[0]-60, subject[1]-22)
card_label(r11[0]-50, r11[1]-10, "1")
card_label(r11[0]+25, r11[1]+20, "M")

# ---- R12: Department "For" Announcement (1:M) ----
# Dept(1200,700) → Announce(400,1350): diagonal left-down corridor
r12 = (800, 1025)
diamond(*r12, 40, 25, "For")
line(dept[0]-80, dept[1]+22, r12[0]+10, r12[1]-25)
line(r12[0]-10, r12[1]+25, announce[0]+90, announce[1]-22)
card_label(r12[0]+25, r12[1]-10, "1")
card_label(r12[0]-40, r12[1]+20, "M")

# ---- R13: Student "Enrolls" Subject (M:M) ----
# Student(1400,1350) → Subject(2400,1350) via Enrollment(1800,2100)
# Student → Enrollment: diagonal down-right
r13a = (1600, 1725)
diamond(*r13a, 40, 25, "Has")
line(student[0]+30, student[1]+22, r13a[0], r13a[1]-25)
line(r13a[0], r13a[1]+25, enroll[0]-77, enroll[1]-22)
card_label(r13a[0]+25, r13a[1]-10, "1")
card_label(r13a[0]+25, r13a[1]+20, "M")

# Subject → Enrollment: diagonal down-left
r13b = (2100, 1725)
diamond(*r13b, 40, 25, "Has")
line(subject[0]-30, subject[1]+22, r13b[0], r13b[1]-25)
line(r13b[0], r13b[1]+25, enroll[0]+77, enroll[1]-22)
card_label(r13b[0]-45, r13b[1]-10, "1")
card_label(r13b[0]-45, r13b[1]+20, "M")

# ---- R14: Teacher "Teaches" Subject (M:M) via TeacherSubject ----
# Teacher(3500,1350) → TeacherSubject(3000,2100)
r14a = (3250, 1725)
diamond(*r14a, 40, 25, "Has")
line(teacher[0]-30, teacher[1]+22, r14a[0], r14a[1]-25)
line(r14a[0], r14a[1]+25, tch_subj[0]+87, tch_subj[1]-22)
card_label(r14a[0]+25, r14a[1]-10, "1")
card_label(r14a[0]+25, r14a[1]+20, "M")

# Subject(2400,1350) → TeacherSubject(3000,2100)
r14b = (2700, 1725)
diamond(*r14b, 40, 25, "Has")
line(subject[0]+30, subject[1]+22, r14b[0], r14b[1]-25)
line(r14b[0], r14b[1]+25, tch_subj[0]-87, tch_subj[1]-22)
card_label(r14b[0]-45, r14b[1]-10, "1")
card_label(r14b[0]-45, r14b[1]+20, "M")

# ---- R15: Student "Scored" InternalMark (1:M) ----
# Student(1400,1350) → InternalMark(900,2100): diagonal left-down
r15 = (1150, 1725)
diamond(*r15, 45, 25, "Scored")
line(student[0]-40, student[1]+22, r15[0]+10, r15[1]-25)
line(r15[0]-10, r15[1]+25, internal[0]+85, internal[1]-22)
card_label(r15[0]+30, r15[1]-10, "1")
card_label(r15[0]-50, r15[1]+20, "M")

# ---- R16: Subject "For" InternalMark (1:M) ----
# Subject(2400,1350) → InternalMark(900,2100): route down from Subject to y=1800 then left
r16 = (900, 1725)
diamond(*r16, 40, 25, "For")
# Route: Subject goes down to y=1700 at x=2400, then left at y=1725 to x=940, then down to IM
polyline([(subject[0]-60, subject[1]+22), (subject[0]-60, 1600), (r16[0]+40, r16[1])])
line(r16[0], r16[1]+25, internal[0], internal[1]-22)
card_label(r16[0]+25, r16[1]-10, "1")
card_label(r16[0]+25, r16[1]+20, "M")

# ---- R17: Student "Marked" Attendance (1:M) ----
# Student(1400,1350) → Attendance(1500,2850): nearly vertical clean corridor
r17 = (1350, 2475)
diamond(*r17, 50, 28, "Marked")
line(student[0]-30, student[1]+22, r17[0], r17[1]-28)
line(r17[0], r17[1]+28, attend[0]-50, attend[1]-22)
card_label(r17[0]-60, r17[1]-10, "1")
card_label(r17[0]-60, r17[1]+25, "M")

# ---- R18: Subject "For" Attendance (1:M) ----
# Subject(2400,1350) → Attendance(1500,2850): route through middle corridor
r18 = (1700, 2475)
diamond(*r18, 40, 25, "For")
polyline([(subject[0], subject[1]+22), (subject[0], 2200), (1700, 2400), (r18[0], r18[1]-25)])
line(r18[0], r18[1]+25, attend[0]+40, attend[1]-22)
card_label(r18[0]+25, r18[1]-10, "1")
card_label(r18[0]+25, r18[1]+20, "M")

# ---- R19: Teacher "Records" Attendance (1:M) ----
# Teacher(3500,1350) → Attendance(1500,2850): route down from Teacher then left
r19 = (2000, 2700)
diamond(*r19, 55, 28, "Records")
polyline([(teacher[0], teacher[1]+22), (teacher[0], 2600), (2400, 2700), (r19[0]+55, r19[1])])
line(r19[0]-55, r19[1], attend[0]+77, attend[1])
card_label(r19[0]+60, r19[1]-18, "1")
card_label(r19[0]-80, r19[1]-18, "M")

# ---- R20: Period "During" Attendance (1:M) ----
# Period(3800,750) → Attendance(1500,2850): route down right side, then across bottom
r20 = (1500, 3150)
diamond(*r20, 50, 28, "During")
polyline([(period[0], period[1]+22), (period[0], 3150), (r20[0]+50, r20[1])])
line(r20[0], r20[1]-28, attend[0], attend[1]+22)
card_label(r20[0]+55, r20[1]-10, "1")
card_label(r20[0]+15, r20[1]-45, "M")

# ---- R21: Department "Has" TimeTable (1:M) ----
# Dept(1200,700) → TimeTable(2800,2850): route right at y=950, then down
r21 = (2800, 2475)
diamond(*r21, 40, 25, "Has")
polyline([(dept[0]+80, dept[1]-5), (2050, 700), (2050, 950), (3600, 950), (3600, 2475), (r21[0]+40, r21[1])])
line(r21[0], r21[1]+25, timetbl[0], timetbl[1]-22)
card_label(r21[0]+25, r21[1]-10, "1")
card_label(r21[0]+25, r21[1]+20, "M")

# ---- R22: Subject "Scheduled" TimeTable (1:M) ----
# Subject(2400,1350) → TimeTable(2800,2850): route via middle corridor
r22 = (2500, 2475)
diamond(*r22, 55, 28, "Scheduled")
polyline([(subject[0]+20, subject[1]+22), (subject[0]+20, 2300), (r22[0], r22[1]-28)])
line(r22[0], r22[1]+28, timetbl[0]-72, timetbl[1]-22)
card_label(r22[0]+40, r22[1]-15, "1")
card_label(r22[0]-70, r22[1]+25, "M")

# ---- R23: Teacher "Assigned" TimeTable (1:M) ----
# Teacher(3500,1350) → TimeTable(2800,2850): route down right then left
r23 = (3100, 2475)
diamond(*r23, 55, 28, "Assigned")
polyline([(teacher[0]+30, teacher[1]+22), (teacher[0]+30, 2400), (r23[0]+55, r23[1])])
line(r23[0]-20, r23[1]+28, timetbl[0]+72, timetbl[1]-22)
card_label(r23[0]+40, r23[1]-15, "1")
card_label(r23[0]-55, r23[1]+25, "M")

# ---- R24: Period "At" TimeTable (1:M) ----
# Period(3800,750) → TimeTable(2800,2850): route down on far right, then left at bottom
r24 = (2800, 3150)
diamond(*r24, 40, 25, "At")
polyline([(period[0]+30, period[1]+22), (period[0]+30, 3300), (3400, 3300), (3400, 3150), (r24[0]+40, r24[1])])
line(r24[0], r24[1]-25, timetbl[0], timetbl[1]+22)
card_label(r24[0]+25, r24[1]-10, "1")
card_label(r24[0]+15, r24[1]-40, "M")

# ---- R25: Admin "Views" Attendance ----
# Admin(2100,250) → Attendance(1500,2850): route left side at x=350
r25 = (350, 2650)
diamond(*r25, 45, 25, "Views")
polyline([(admin[0]-55, admin[1]+5), (350, admin[1]+5), (350, r25[1]-25)])
line(r25[0]+45, r25[1]+10, attend[0]-77, attend[1]-10)
card_label(r25[0]+30, r25[1]-10, "1")
card_label(r25[0]+50, r25[1]+20, "M")

# ---- R26: Admin "Views" TimeTable ----
# Already covered by R21 dept→timetable and R2 admin→dept

# ==========================================================================
# TITLE
# ==========================================================================
shapes_svg.insert(0, '<text x="2100" y="50" text-anchor="middle" font-size="26" font-weight="bold" font-family="Arial">ER DIAGRAM — PCAS-Connect (College Attendance &amp; Academic Management System)</text>')

# ==========================================================================
# BUILD SVG
# ==========================================================================
svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<rect width="{W}" height="{H}" fill="white"/>
{"".join(lines_svg)}
{"".join(shapes_svg)}
</svg>'''

out_svg = '/home/mohammednasikk/Desktop/PCAS-Connect/docs/er_diagram.svg'
with open(out_svg, 'w') as f:
    f.write(svg)
print(f"SVG saved to: {out_svg}")

# Convert to PNG
try:
    import cairosvg
    out_png = '/home/mohammednasikk/Desktop/PCAS-Connect/docs/er_diagram.png'
    cairosvg.svg2png(url=out_svg, write_to=out_png)
    print(f"PNG saved to: {out_png}")
except Exception as e:
    print(f"PNG conversion failed: {e}")
