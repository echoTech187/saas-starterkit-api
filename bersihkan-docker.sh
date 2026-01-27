#!/bin/bash

    echo "---------------------------------------------"
    echo "Mulai bersih-bersih pada: $(date)"

    # 1. Hapus Container mati, Network gak guna, dan Image gantung
    # -a : All (hapus semua image yg gak dipake, bukan cuma yg dangling)
    # -f : Force (jangan tanya Yes/No lagi, langsung sikat)
    # --filter : Hapus hanya yang dibuat lebih dari 24 jam lalu (BIAR AMAN)
    docker system prune -a -f --filter "until=24h"

    # 2. Hapus Cache Build (Sisa npm install yang numpuk)
    # Ini yang paling sering bikin harddisk penuh
    docker builder prune -a -f --filter "until=24h"

    echo "Selesai! Sisa harddisk sekarang:"
    df -h | grep '/$'
    echo "---------------------------------------------"