import requests
import urllib.parse
import sys

dot_graph = """
graph ER {
    layout=fdp;
    overlap=false;
    splines=true;
    repulsiveforce=2.5;
    K=0.8;
    node [fontname="Helvetica,Arial,sans-serif", fontsize=10];
    edge [fontname="Helvetica,Arial,sans-serif", fontsize=10];

    // Entities
    node [shape=box, style=filled, fillcolor="#f9f9f9", height=0.5, width=1.0];
    Department; Batch; Subject; Student; Teacher; Announcement; Period; TimeTable; Attendance; InternalMark; User;

    // Relationships
    node [shape=diamond, style=filled, fillcolor="#e0f7fa", height=0.5, width=0.8];
    Offers; Employs; Dept_Student; Enrolls; Teaches; Stud_User; Teach_User; Sends; TargetedAt; Dept_TT; Teach_TT; Period_TT; Subj_TT; Stud_Att; Subj_Att; Teach_Att; Period_Att; Stud_IM; Subj_IM;

    // Attributes for Department
    node [shape=ellipse, style=solid, fillcolor=white];
    dept_id [label=<<u>id</u>>]; dept_name [label="name"]; dept_code [label="code"];
    Department -- dept_id; Department -- dept_name; Department -- dept_code;

    // Attributes for Batch
    batch_id [label=<<u>id</u>>]; batch_name [label="name"]; batch_start [label="start_year"]; batch_end [label="end_year"]; batch_active [label="is_active"];
    Batch -- batch_id; Batch -- batch_name; Batch -- batch_start; Batch -- batch_end; Batch -- batch_active;

    // Attributes for Subject
    subj_id [label=<<u>id</u>>]; subj_name [label="name"]; subj_code [label="code"]; subj_sem [label="semester"]; subj_credit [label="credit"]; subj_type [label="subject_type"];
    Subject -- subj_id; Subject -- subj_name; Subject -- subj_code; Subject -- subj_sem; Subject -- subj_credit; Subject -- subj_type;

    // Attributes for Student
    stud_id [label=<<u>id</u>>]; stud_name [label="name"]; stud_reg [label="register_number"]; stud_email [label="email"]; stud_sem [label="semester"]; stud_dob [label="dob"]; stud_phone [label="phone_number"]; stud_addr [label="address"]; stud_bg [label="blood_group"]; stud_pwd [label="requires_password_change"];
    Student -- stud_id; Student -- stud_name; Student -- stud_reg; Student -- stud_email; Student -- stud_sem; Student -- stud_dob; Student -- stud_phone; Student -- stud_addr; Student -- stud_bg; Student -- stud_pwd;

    // Attributes for Teacher
    teach_id [label=<<u>id</u>>]; teach_name [label="name"]; teach_email [label="email"]; teach_phone [label="phone"]; teach_dob [label="dob"]; teach_doj [label="date_of_joining"]; teach_gender [label="gender"]; teach_qual [label="qualification"]; teach_role [label="role"]; teach_hod [label="is_hod"]; teach_pwd [label="requires_password_change"];
    Teacher -- teach_id; Teacher -- teach_name; Teacher -- teach_email; Teacher -- teach_phone; Teacher -- teach_dob; Teacher -- teach_doj; Teacher -- teach_gender; Teacher -- teach_qual; Teacher -- teach_role; Teacher -- teach_hod; Teacher -- teach_pwd;

    // Attributes for Announcement
    ann_id [label=<<u>id</u>>]; ann_title [label="title"]; ann_content [label="content"]; ann_date [label="date"]; ann_aud [label="audience"]; ann_sem [label="semester"];
    Announcement -- ann_id; Announcement -- ann_title; Announcement -- ann_content; Announcement -- ann_date; Announcement -- ann_aud; Announcement -- ann_sem;

    // Attributes for Period
    per_id [label=<<u>id</u>>]; per_num [label="number"]; per_start [label="start_time"]; per_end [label="end_time"];
    Period -- per_id; Period -- per_num; Period -- per_start; Period -- per_end;

    // Attributes for Attendance
    att_id [label=<<u>id</u>>]; att_date [label="date"]; att_status [label="status"];
    Attendance -- att_id; Attendance -- att_date; Attendance -- att_status;

    // Attributes for TimeTable
    tt_id [label=<<u>id</u>>]; tt_sem [label="semester"]; tt_day [label="day"];
    TimeTable -- tt_id; TimeTable -- tt_sem; TimeTable -- tt_day;

    // Attributes for InternalMark
    im_id [label=<<u>id</u>>]; im_t1_score [label="test_1_scored"]; im_t1_tot [label="test_1_total"]; im_t2_score [label="test_2_scored"]; im_t2_tot [label="test_2_total"]; im_tot [label="total"]; im_draft [label="is_draft"]; im_subm [label="is_submitted"]; im_appr [label="is_approved"]; im_upd [label="updated_at"];
    InternalMark -- im_id; InternalMark -- im_t1_score; InternalMark -- im_t1_tot; InternalMark -- im_t2_score; InternalMark -- im_t2_tot; InternalMark -- im_tot; InternalMark -- im_draft; InternalMark -- im_subm; InternalMark -- im_appr; InternalMark -- im_upd;

    // Attributes for User
    user_id [label=<<u>id</u>>]; user_name [label="username"]; user_pwd [label="password"]; user_mail [label="email"];
    User -- user_id; User -- user_name; User -- user_pwd; User -- user_mail;

    // Edges between Entities and Relationships
    // Department relationships
    Offers -- Department [label="1"]; Offers -- Subject [label="N"];
    Employs -- Department [label="1"]; Employs -- Teacher [label="N"];
    Dept_Student -- Department [label="1"]; Dept_Student -- Student [label="N"];

    // Student and Subject
    Enrolls -- Student [label="M"]; Enrolls -- Subject [label="N"];
    
    // Teacher and Subject
    Teaches -- Teacher [label="M"]; Teaches -- Subject [label="N"];

    // Users
    Stud_User -- Student [label="1"]; Stud_User -- User [label="1"];
    Teach_User -- Teacher [label="1"]; Teach_User -- User [label="1"];

    // Announcement
    Sends -- User [label="1"]; Sends -- Announcement [label="N"];
    TargetedAt -- Announcement [label="N"]; TargetedAt -- Department [label="1"]; // Nullable in schema

    // TimeTable
    Dept_TT -- Department [label="1"]; Dept_TT -- TimeTable [label="N"];
    Teach_TT -- Teacher [label="1"]; Teach_TT -- TimeTable [label="N"];
    Period_TT -- Period [label="1"]; Period_TT -- TimeTable [label="N"];
    Subj_TT -- Subject [label="1"]; Subj_TT -- TimeTable [label="N"];

    // Attendance
    Stud_Att -- Student [label="1"]; Stud_Att -- Attendance [label="N"];
    Subj_Att -- Subject [label="1"]; Subj_Att -- Attendance [label="N"];
    Teach_Att -- Teacher [label="1"]; Teach_Att -- Attendance [label="N"];
    Period_Att -- Period [label="1"]; Period_Att -- Attendance [label="N"];

    // InternalMark
    Stud_IM -- Student [label="1"]; Stud_IM -- InternalMark [label="N"];
    Subj_IM -- Subject [label="1"]; Subj_IM -- InternalMark [label="N"];
}
"""

url = "https://quickchart.io/graphviz"
data = {"graph": dot_graph, "format": "png", "layout": "fdp"}
print("Sending request to quickchart...")
resp = requests.post(url, json=data)

if resp.content.startswith(b'\x89PNG'):
    out_path = "/home/mohammednasikk/Desktop/PCAS-Connect/ER_Diagram_PCAS-Connect.png"
    with open(out_path, "wb") as f:
        f.write(resp.content)
    print(f"Success! Saved to {out_path}")
else:
    print(f"Failed with status {resp.status_code}")
    print(resp.text)
