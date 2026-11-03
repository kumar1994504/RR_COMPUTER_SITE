# -*- coding: utf-8 -*-
"""
Matisha Infotec - Scrolling Announcement / Ticker Manager
Dual mode: Modern Desktop GUI (default) + Clean Console CLI (--cli)
Uses Windows native 'Nirmala UI' font to prevent any Tamil text overlap.
"""

import os
import sys
import json
import time
import webbrowser

UPDATES_FILE = os.path.join(os.path.dirname(__file__), 'data', 'updates.json')

def load_updates():
    if not os.path.exists(UPDATES_FILE):
        return []
    try:
        with open(UPDATES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {UPDATES_FILE}: {e}")
        return []

def save_updates(updates):
    try:
        with open(UPDATES_FILE, 'w', encoding='utf-8') as f:
            json.dump(updates, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error saving {UPDATES_FILE}: {e}")
        return False

# ============================================================
# GUI MODE (Tkinter) - Uses Nirmala UI font for 0% text overlap
# ============================================================

def launch_gui():
    import tkinter as tk
    from tkinter import ttk, messagebox

    root = tk.Tk()
    root.title("Matisha Infotec - Scrolling Announcement Manager")
    root.geometry("820x640")
    root.minsize(740, 560)
    root.configure(bg="#F8FAFC")

    # Set application icon if exists
    try:
        ico_path = os.path.join(os.path.dirname(__file__), 'assets', 'icon-192.png')
        if os.path.exists(ico_path):
            img = tk.PhotoImage(file=ico_path)
            root.iconphoto(False, img)
    except Exception:
        pass

    font_base = ("Nirmala UI", 10)
    font_bold = ("Nirmala UI", 10, "bold")
    font_title = ("Nirmala UI", 14, "bold")
    font_small = ("Nirmala UI", 9)

    updates = load_updates()
    selected_idx = None

    # Header Banner
    header = tk.Frame(root, bg="#0F2A44", height=65)
    header.pack(fill="x")
    header.pack_propagate(False)

    title_lbl = tk.Label(
        header,
        text="மதிஷா இன்போடெக் - நேரடி ஸ்க்ரோலிங் அறிவிப்புகள் மேலாளர்",
        font=font_title,
        fg="#FFFFFF",
        bg="#0F2A44"
    )
    title_lbl.pack(side="left", padx=18, pady=12)

    sub_lbl = tk.Label(
        header,
        text="Live Scrolling Ticker Manager",
        font=font_small,
        fg="#FDE68A",
        bg="#0F2A44"
    )
    sub_lbl.pack(side="right", padx=18, pady=16)

    # Main Body
    main_frame = tk.Frame(root, bg="#F8FAFC", padx=16, pady=12)
    main_frame.pack(fill="both", expand=True)

    # Top List Area
    list_frame = tk.LabelFrame(
        main_frame,
        text="தற்போதைய அறிவிப்புகள் (Current Announcements)",
        font=font_bold,
        bg="#F8FAFC",
        fg="#1E293B",
        padx=10,
        pady=8
    )
    list_frame.pack(fill="both", expand=True, pady=(0, 10))

    tree_cols = ("tag", "tamil", "english", "link")
    tree = ttk.Treeview(list_frame, columns=tree_cols, show="headings", height=6, selectmode="browse")
    tree.heading("tag", text="வகை (Tag)")
    tree.heading("tamil", text="தமிழ் செய்தி (Tamil Message)")
    tree.heading("english", text="ஆங்கில செய்தி (English Message)")
    tree.heading("link", text="இணைப்பு (Link)")

    tree.column("tag", width=120, anchor="center")
    tree.column("tamil", width=340, anchor="w")
    tree.column("english", width=220, anchor="w")
    tree.column("link", width=100, anchor="w")

    tree_scroll = ttk.Scrollbar(list_frame, orient="vertical", command=tree.yview)
    tree.configure(yscrollcommand=tree_scroll.set)
    tree.pack(side="left", fill="both", expand=True)
    tree_scroll.pack(side="right", fill="y")

    # Form Fields Area
    form_frame = tk.LabelFrame(
        main_frame,
        text="அறிவிப்பு விவரங்கள் (Announcement Details)",
        font=font_bold,
        bg="#F8FAFC",
        fg="#1E293B",
        padx=14,
        pady=10
    )
    form_frame.pack(fill="x", pady=(0, 10))

    # Row 1: Tag & Link
    row1 = tk.Frame(form_frame, bg="#F8FAFC")
    row1.pack(fill="x", pady=4)

    tk.Label(row1, text="வகை (Tag):", font=font_bold, bg="#F8FAFC", width=12, anchor="w").pack(side="left")
    tag_combo = ttk.Combobox(row1, font=font_base, width=22)
    tag_combo['values'] = ("முக்கிய அறிவிப்பு", "தேர்வு பதிவு", "நலத்திட்டம்", "கல்லூரி சேர்க்கை", "விடுமுறை அறிவிப்பு", "புதிய சேவை")
    tag_combo.set("முக்கிய அறிவிப்பு")
    tag_combo.pack(side="left", padx=(0, 18))

    tk.Label(row1, text="இணைப்பு (Link):", font=font_bold, bg="#F8FAFC", width=14, anchor="w").pack(side="left")
    link_entry = ttk.Entry(row1, font=font_base)
    link_entry.insert(0, "services.html")
    link_entry.pack(side="left", fill="x", expand=True)

    # Row 2: Tamil Message
    row2 = tk.Frame(form_frame, bg="#F8FAFC")
    row2.pack(fill="x", pady=4)

    tk.Label(row2, text="தமிழ் செய்தி:", font=font_bold, bg="#F8FAFC", width=12, anchor="w").pack(side="left")
    ta_entry = ttk.Entry(row2, font=font_base)
    ta_entry.pack(side="left", fill="x", expand=True)

    # Row 3: English Message
    row3 = tk.Frame(form_frame, bg="#F8FAFC")
    row3.pack(fill="x", pady=4)

    tk.Label(row3, text="ஆங்கில செய்தி:", font=font_bold, bg="#F8FAFC", width=12, anchor="w").pack(side="left")
    en_entry = ttk.Entry(row3, font=font_base)
    en_entry.pack(side="left", fill="x", expand=True)

    def refresh_tree():
        for row in tree.get_children():
            tree.delete(row)
        for idx, item in enumerate(updates):
            tag_disp = item.get('tag_ta') or item.get('tag', 'UPDATE')
            ta_disp = item.get('title_ta') or item.get('title', '')
            en_disp = item.get('title') or ta_disp
            link_disp = item.get('link', 'services.html')
            tree.insert("", "end", iid=str(idx), values=(tag_disp, ta_disp, en_disp, link_disp))

    def on_select(evt):
        nonlocal selected_idx
        sel = tree.selection()
        if not sel:
            selected_idx = None
            return
        selected_idx = int(sel[0])
        item = updates[selected_idx]
        
        tag_combo.set(item.get('tag_ta') or item.get('tag', 'முக்கிய அறிவிப்பு'))
        ta_entry.delete(0, tk.END)
        ta_entry.insert(0, item.get('title_ta', ''))
        en_entry.delete(0, tk.END)
        en_entry.insert(0, item.get('title', ''))
        link_entry.delete(0, tk.END)
        link_entry.insert(0, item.get('link', 'services.html'))

    tree.bind("<<TreeviewSelect>>", on_select)

    def clear_form():
        nonlocal selected_idx
        selected_idx = None
        tree.selection_remove(tree.selection())
        tag_combo.set("முக்கிய அறிவிப்பு")
        ta_entry.delete(0, tk.END)
        en_entry.delete(0, tk.END)
        link_entry.delete(0, tk.END)
        link_entry.insert(0, "services.html")
        ta_entry.focus_set()

    def add_or_update():
        nonlocal selected_idx
        ta_text = ta_entry.get().strip()
        if not ta_text:
            messagebox.showwarning("எச்சரிக்கை", "தயவுசெய்து தமிழ் செய்தியை உள்ளிடவும்!")
            ta_entry.focus_set()
            return
            
        en_text = en_entry.get().strip() or ta_text
        tag_text = tag_combo.get().strip() or "முக்கிய அறிவிப்பு"
        link_text = link_entry.get().strip() or "services.html"
        
        # English tag mapping
        tag_en_map = {
            "முக்கிய அறிவிப்பு": "NOTICE",
            "தேர்வு பதிவு": "EXAMS",
            "நலத்திட்டம்": "SCHEMES",
            "கல்லூரி சேர்க்கை": "ADMISSION",
            "விடுமுறை அறிவிப்பு": "HOLIDAY",
            "புதிய சேவை": "NEW"
        }
        tag_en = tag_en_map.get(tag_text, "NOTICE")

        item_data = {
            "id": f"update-{int(time.time())}",
            "tag": tag_en,
            "tag_ta": tag_text,
            "title": en_text,
            "title_ta": ta_text,
            "link": link_text
        }

        if selected_idx is not None and 0 <= selected_idx < len(updates):
            item_data["id"] = updates[selected_idx].get("id", item_data["id"])
            updates[selected_idx] = item_data
            status_lbl.config(text="அறிவிப்பு மாற்றப்பட்டது (Updated). 'சேமி' அழுத்தவும்.", fg="#047857")
        else:
            updates.insert(0, item_data)
            status_lbl.config(text="புதிய அறிவிப்பு சேர்க்கப்பட்டது. 'சேமி' அழுத்தவும்.", fg="#047857")

        refresh_tree()
        clear_form()

    def delete_item():
        nonlocal selected_idx
        if selected_idx is None:
            messagebox.showinfo("தகவல்", "நீக்க வேண்டிய அறிவிப்பை பட்டியலில் தேர்ந்தெடுக்கவும்.")
            return
        if messagebox.askyesno("உறுதிப்படுத்தவும்", "இந்த அறிவிப்பை நிச்சயமாக நீக்க வேண்டுமா?"):
            updates.pop(selected_idx)
            refresh_tree()
            clear_form()
            status_lbl.config(text="அறிவிப்பு நீக்கப்பட்டது. 'சேமி' அழுத்தவும்.", fg="#B91C1C")

    def move_up():
        nonlocal selected_idx
        if selected_idx is None or selected_idx <= 0:
            return
        updates[selected_idx], updates[selected_idx - 1] = updates[selected_idx - 1], updates[selected_idx]
        selected_idx -= 1
        refresh_tree()
        tree.selection_set(str(selected_idx))

    def move_down():
        nonlocal selected_idx
        if selected_idx is None or selected_idx >= len(updates) - 1:
            return
        updates[selected_idx], updates[selected_idx + 1] = updates[selected_idx + 1], updates[selected_idx]
        selected_idx += 1
        refresh_tree()
        tree.selection_set(str(selected_idx))

    def save_all():
        if save_updates(updates):
            messagebox.showinfo("வெற்றி!", "அனைத்து அறிவிப்புகளும் வெற்றிகரமாகச் சேமிக்கப்பட்டன!\nதளத்தில் உடனடியாக பிரதிபலிக்கும்.")
            status_lbl.config(text="வெற்றிகரமாகச் சேமிக்கப்பட்டது (Saved successfully!)", fg="#047857")
        else:
            messagebox.showerror("பிழை", "சேமிப்பதில் பிழை ஏற்பட்டது.")

    def open_site():
        idx_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'index.html'))
        webbrowser.open(f"file:///{idx_path}")

    # Buttons Toolbar
    btn_bar = tk.Frame(main_frame, bg="#F8FAFC")
    btn_bar.pack(fill="x", pady=6)

    btn_add = tk.Button(
        btn_bar,
        text="+ சேர்க்க / மாற்ற (Apply to List)",
        font=font_bold,
        bg="#0F5C3A",
        fg="#FFFFFF",
        activebackground="#093C26",
        activeforeground="#FFFFFF",
        relief="groove",
        padx=12,
        pady=6,
        command=add_or_update
    )
    btn_add.pack(side="left", padx=(0, 8))

    btn_clear = tk.Button(
        btn_bar,
        text="படிவம் அழிக்க (Clear Form)",
        font=font_base,
        bg="#E2E8F0",
        fg="#334155",
        relief="groove",
        padx=10,
        pady=6,
        command=clear_form
    )
    btn_clear.pack(side="left", padx=(0, 8))

    btn_del = tk.Button(
        btn_bar,
        text="நீக்கு (Delete)",
        font=font_base,
        bg="#FEE2E2",
        fg="#B91C1C",
        activebackground="#FCA5A5",
        relief="groove",
        padx=10,
        pady=6,
        command=delete_item
    )
    btn_del.pack(side="left", padx=(0, 8))

    btn_up = tk.Button(btn_bar, text="▲ மேலே", font=font_base, bg="#F1F5F9", relief="groove", padx=8, pady=6, command=move_up)
    btn_up.pack(side="left", padx=(0, 4))

    btn_down = tk.Button(btn_bar, text="▼ கீழே", font=font_base, bg="#F1F5F9", relief="groove", padx=8, pady=6, command=move_down)
    btn_down.pack(side="left", padx=(0, 14))

    btn_save = tk.Button(
        btn_bar,
        text="💾 சேமி (Save to Site)",
        font=font_bold,
        bg="#D97706",
        fg="#FFFFFF",
        activebackground="#B45309",
        activeforeground="#FFFFFF",
        relief="raised",
        padx=16,
        pady=6,
        command=save_all
    )
    btn_save.pack(side="right", padx=(8, 0))

    btn_prev = tk.Button(
        btn_bar,
        text="🌐 தளம் பார்க்க (Preview)",
        font=font_base,
        bg="#E0F2FE",
        fg="#0369A1",
        relief="groove",
        padx=12,
        pady=6,
        command=open_site
    )
    btn_prev.pack(side="right")

    # Bottom Status Bar
    status_frame = tk.Frame(root, bg="#E2E8F0", height=28)
    status_frame.pack(fill="x", side="bottom")

    status_lbl = tk.Label(
        status_frame,
        text="தயார் நிலையில் உள்ளது (Ready) · கோப்பு: data/updates.json",
        font=font_small,
        bg="#E2E8F0",
        fg="#475569"
    )
    status_lbl.pack(side="left", padx=12, pady=4)

    refresh_tree()
    root.mainloop()

# ============================================================
# CLI MODE - Clean ASCII without emojis to prevent CMD overlap
# ============================================================

def launch_cli():
    # Set Windows console to UTF-8
    if sys.platform.startswith('win'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
            sys.stdin.reconfigure(encoding='utf-8')
        except Exception:
            pass

    updates = load_updates()

    while True:
        print("\n" + "=" * 65)
        print("  MATISHA INFOTEC - SCROLLING ANNOUNCEMENT MANAGER")
        print("=" * 65)
        print("  [1] Add New Announcement")
        print("  [2] View All Announcements")
        print("  [3] Delete an Announcement")
        print("  [4] Exit")
        print("-" * 65)

        choice = input("Enter choice (1-4): ").strip()
        if choice == '1':
            print("\n--- Add New Announcement ---")
            tag_ta = input("Tag [Notice]: ").strip() or "Notice"
            tag_en = input("English Tag [NOTICE]: ").strip() or "NOTICE"
            title_ta = input("Tamil Message: ").strip()
            if not title_ta:
                print("Message cannot be empty!")
                continue
            title_en = input("English Message (Enter to copy Tamil): ").strip() or title_ta
            link = input("Link [services.html]: ").strip() or "services.html"

            new_item = {
                "id": f"update-{int(time.time())}",
                "tag": tag_en,
                "tag_ta": tag_ta,
                "title": title_en,
                "title_ta": title_ta,
                "link": link
            }
            updates.insert(0, new_item)
            if save_updates(updates):
                print(">> Saved successfully to data/updates.json!")
        elif choice == '2':
            print("\n--- Current Announcements ---")
            if not updates:
                print("(No announcements found)")
            for i, u in enumerate(updates, 1):
                print(f"[{i}] [{u.get('tag_ta', '')} / {u.get('tag', '')}]")
                print(f"    Tamil:   {u.get('title_ta', '')}")
                print(f"    English: {u.get('title', '')}")
                print(f"    Link:    {u.get('link', '')}")
                print("-" * 50)
            input("\nPress Enter to continue...")
        elif choice == '3':
            if not updates:
                print("No announcements to delete.")
                continue
            for i, u in enumerate(updates, 1):
                print(f"[{i}] {u.get('title_ta', '')}")
            del_idx = input("Enter number to delete (or Enter to cancel): ").strip()
            if del_idx.isdigit() and 1 <= int(del_idx) <= len(updates):
                removed = updates.pop(int(del_idx) - 1)
                if save_updates(updates):
                    print(f">> Removed: {removed.get('title_ta', '')}")
        elif choice == '4':
            print("Done!")
            break

if __name__ == '__main__':
    # Default to GUI if Tkinter is available and not explicitly --cli
    if '--cli' in sys.argv:
        launch_cli()
    else:
        try:
            launch_gui()
        except Exception as e:
            print(f"GUI could not start: {e}. Falling back to CLI mode...")
            launch_cli()
