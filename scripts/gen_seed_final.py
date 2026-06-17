#!/usr/bin/env python3
import json, sys

def esc(v):
    if v is None: return "NULL"
    if isinstance(v, bool): return "TRUE" if v else "FALSE"
    if isinstance(v, int): return str(v)
    if isinstance(v, str): return "'" + v.replace("'", "''") + "'"
    raise ValueError(str(type(v)))

def jb(v):
    s = json.dumps(v, ensure_ascii=False)
    return "'" + s.replace("'", "''") + "'::jsonb"

def ca(arr):
    return "ARRAY[" + ", ".join(esc(x) for x in arr) + "]"

# === TEMPLATE DATA ===
templates = []

# Template builder: (slug, title, emoji, color, cat, dur, age, desc, why, careers,
#                    big_wins, small_wins, daily, future, onb)
# each as tuples for compactness

S, C, B, H, T, L = "sports", "creative", "business", "health", "tech", "lifestyle"

# We'll build this more efficiently by defining common patterns

temp_data = []

# fmt: slug, title, emoji, color, cat, dur, min, max, jdur, desc, why, [careers],
#      [bw...], [sw...], {daily...}, [af...], [oq...]

temp_data.append((
    "pro-footballer", "Pemain Sepak Bola Profesional", "\u26bd", "from-green-600 to-emerald-500", S, "8-15 tahun", 8, 35, "8-15 tahun",
    "Jalur menjadi pesepakbola profesional dari SSB sampai ke klub besar. Cocok buat lo yang dari kecil bercita-cita jadi pemain Timnas.",
    "Sepak bola bukan cuma olahraga \u2014 ini sekolah kehidupan. Lewat sepak bola lo belajar disiplin, kerja tim, dan mental baja. Pemain profesional ngga cuma ngejar gol, tapi jadi inspirasi buat generasi muda Indonesia.",
    ["Pemain Klub Profesional (Liga 1, Liga 2)","Tim Nasional Indonesia","Pemain Luar Negeri (Asia, Eropa)","Pelatih Profesional","Akademi Pembinaan Muda","Analis Sepak Bola","Manajer Olahraga"],
))

print("Script template defined")
