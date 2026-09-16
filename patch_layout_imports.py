with open(r'c:\Proyectos\Gestion compras\src\components\Layout.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

import re
code = code.replace("import React from 'react';", "import React, { useState } from 'react';")
code = code.replace("import { ShoppingCart, Users, Settings, Building2, Wallet, UserCog, Package, FileText } from 'lucide-react';", "import { ShoppingCart, Users, Settings, Building2, Wallet, UserCog, Package, FileText, MessageSquare, X, Send } from 'lucide-react';")

with open(r'c:\Proyectos\Gestion compras\src\components\Layout.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
