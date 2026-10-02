@extends('company.staff.main')

@section('title', 'Create')

@section('content')

    <section>

        <div class="customer-order-create">

            <main>

                @if (session('success-message'))
                    <div class="success-message left-green">
                        <i class='bx bxs-check-circle'></i>
                        <div class="text">
                            <span>Success</span>
                            <span class="message">{{ session('success-message') }}</span>
                            @if (session('table_link'))
                                <div class="table-link-info" style="margin-top: 10px; padding: 10px; background: #f0f8ff; border-radius: 5px;">
                                    <strong>Table Code:</strong> {{ session('table_code') }}<br>
                                    <strong>Table Link:</strong>
                                    <input type="text" id="tableLink" value="{{ session('table_link') }}" readonly style="width: 300px; margin: 5px 0;">
                                    <button onclick="copyTableLink()" style="margin-left: 5px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Copy Link</button>
                                    <div id="qrcode-{{ session('new_table_id') }}" style="margin-top: 10px;"></div>
                                </div>
                            @endif
                        </div>
                    </div>
                @endif

                <div class="content">

                    <div class="header">
                        <h1>Create Dining Table No.</h1>
                    </div>

                    <form action="{{ route('customer-order.store') }}" method="POST">

                        @csrf

                        <div class="create-section">

                            <div class="header">
                                <h4>Dining Table Details</h4>
                            </div>

                            <span class="star">Table No.</span>
                            <input type="text" name="table_number" placeholder="Enter Table Number e.g. 12" required>
                            @foreach ($errors->get('validation-error-message') as $error)
                                <div class="validation-error-message">{{ $error }}</div>
                            @endforeach

                        </div>

                        <div class="button-section">
                            <input type="submit" value="Add Table">
                            <a href="{{ route('customer-order') }}"><span>Cancel</span></a>
                        </div>

                        <input type="hidden" name="_token" value="{{ csrf_token() }}" />

                    </form>

                    <div class="dining-table-section">

                        <div class="table-top">
                            <h3>Dining Tables</h3>
                        </div>

                        <table>

                            <thead>
                                <tr>
                                    <th><input type="checkbox"></th>
                                    <th>Table No.</th>
                                    <th>Status</th>
                                    <th>QR Code</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>
                                @foreach ($diningTable as $table)
                                    <tr>
                                        <td><input type="checkbox"></td>
                                        <td>{{ $table->table_name }}</td>
                                        <td>
                                            @if ($table->isOccupied)
                                                Occupied
                                            @else
                                                Available
                                            @endif
                                        </td>
                                        <td>
                                            <div style="display: flex; flex-direction: column; align-items: center;">
                                                <div id="qr-{{ $table->id }}" style="width: 60px; height: 60px; margin-bottom: 8px;"></div>
                                                <button onclick="downloadQRDirect({{ $table->id }}, '{{ $table->encrypted_simple_url }}', '{{ $table->table_name }}', true)" style="padding: 5px 8px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 4px;"><i class='bx bx-download' style="padding-bottom: 3px; margin-right: -1px; "></i>Download QR</button>
                                            </div>
                                        </td>
                                        <td><a href="#"><i class='bx bxs-pencil'></i><span>Edit</span></a></td>
                                    </tr>
                                @endforeach
                            </tbody>

                        </table>

                    </div>

                </div>

            </main>

        </div>

    </section>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js"></script>
<script>
// Polyfill for roundRect if not supported
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
    };
}

// Wait for QRCode library to load with improved error handling
function waitForQRCode(callback, maxAttempts = 100) {
    let attempts = 0;
    const checkInterval = setInterval(function() {
        attempts++;
        if (typeof qrcode !== 'undefined') {
            clearInterval(checkInterval);
            console.log('QRCode library loaded successfully');
            callback();
        } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.error('QRCode library failed to load after ' + maxAttempts + ' attempts. Please refresh the page.');
            alert('خطأ في تحميل مكتبة QR Code. يرجى تحديث الصفحة.');
        }
    }, 200);
}

// Helper function to generate QR code as data URL with logo embedding
function generateQRDataURL(text, size = 256) {
    return new Promise((resolve, reject) => {
        try {
            // Use High error correction level for logo embedding
            const qr = qrcode(0, 'H'); // High error correction for logo embedding
            qr.addData(text);
            qr.make();

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const moduleCount = qr.getModuleCount();

            // Ensure good cell size for optimal scanning with logo
            const minCellSize = 4;
            const calculatedCellSize = Math.floor(size / moduleCount);
            const cellSize = Math.max(minCellSize, calculatedCellSize);
            const actualSize = cellSize * moduleCount;

            canvas.width = actualSize;
            canvas.height = actualSize;

            // Pure white background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, actualSize, actualSize);

            // Pure black modules
            ctx.fillStyle = '#000000';

            // Calculate logo area (center area to skip)
            const logoAreaSize = Math.floor(moduleCount * 0.25); // 25% of QR code for logo
            const logoStart = Math.floor((moduleCount - logoAreaSize) / 2);
            const logoEnd = logoStart + logoAreaSize;

            // Draw QR code modules, skipping center area for logo
            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    // Skip center area for logo
                    if (row >= logoStart && row < logoEnd && col >= logoStart && col < logoEnd) {
                        continue;
                    }

                    if (qr.isDark(row, col)) {
                        const x = col * cellSize;
                        const y = row * cellSize;
                        ctx.fillRect(x, y, cellSize, cellSize);
                    }
                }
            }

            // Create final canvas with quiet zone
            const quietZone = Math.floor(cellSize * 2); // Small quiet zone
            const finalSize = actualSize + (quietZone * 2);
            const finalCanvas = document.createElement('canvas');
            const finalCtx = finalCanvas.getContext('2d');

            finalCanvas.width = finalSize;
            finalCanvas.height = finalSize;

            // White background for final canvas
            finalCtx.fillStyle = '#FFFFFF';
            finalCtx.fillRect(0, 0, finalSize, finalSize);

            // Draw QR code in center with quiet zone
            finalCtx.drawImage(canvas, quietZone, quietZone);

            // Add logo in center
            const logoImg = new Image();
            logoImg.onload = function() {
                const logoSize = logoAreaSize * cellSize * 0.8; // 80% of reserved area
                const logoX = (finalSize - logoSize) / 2;
                const logoY = (finalSize - logoSize) / 2;

                // Draw white background circle with shadow for logo
                const centerX = finalSize / 2;
                const centerY = finalSize / 2;
                const bgRadius = logoSize / 2 + 8;

                // Shadow
                finalCtx.shadowColor = 'rgba(0,0,0,0.3)';
                finalCtx.shadowBlur = 8;
                finalCtx.shadowOffsetX = 2;
                finalCtx.shadowOffsetY = 2;

                finalCtx.fillStyle = '#FFFFFF';
                finalCtx.beginPath();
                finalCtx.arc(centerX, centerY, bgRadius, 0, 2 * Math.PI);
                finalCtx.fill();

                // Reset shadow
                finalCtx.shadowColor = 'transparent';
                finalCtx.shadowBlur = 0;
                finalCtx.shadowOffsetX = 0;
                finalCtx.shadowOffsetY = 0;

                // Draw logo with rounded corners
                finalCtx.save();
                finalCtx.beginPath();
                finalCtx.roundRect(logoX, logoY, logoSize, logoSize, logoSize * 0.15);
                finalCtx.clip();
                finalCtx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
                finalCtx.restore();

                console.log('QR Code with Logo Debug Info:', {
                    originalText: text,
                    textLength: text.length,
                    moduleCount: moduleCount,
                    cellSize: cellSize,
                    actualQRSize: actualSize,
                    finalSizeWithQuietZone: finalSize,
                    quietZone: quietZone,
                    logoAreaSize: logoAreaSize,
                    logoSize: logoSize,
                    errorCorrectionLevel: 'H',
                    dataURL: finalCanvas.toDataURL().substring(0, 50) + '...'
                });

                resolve(finalCanvas.toDataURL());
            };

            logoImg.onerror = function() {
                console.warn('Logo failed to load, generating QR without logo');
                resolve(finalCanvas.toDataURL());
            };

            // Set logo source - using restaurant logo
            logoImg.src = '/images/logo.png';

        } catch (error) {
            console.error('QR Code generation failed:', error);
            reject(error);
        }
    });
}

// Initialize QR codes when library is ready
window.addEventListener('load', function() {
    waitForQRCode(initQRCodes);
});
</script>
<script>
// Copy functions removed - links are now encrypted for security

// Function to download QR code as image
function downloadQR(dataUrl, tableCode) {
    const link = document.createElement('a');
    link.download = `Table-${tableCode}-QR.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to show large QR code in modal
// Function to download QR code directly without modal
function downloadQRDirect(tableId, tableUrl, tableName, withLogo = true) {
    console.log('downloadQRDirect called with:', tableId, tableUrl, tableName);

    // Use the same waiting mechanism as initQRCodes
    waitForQRCode(function() {
        try {
            // Generate QR code and download immediately with logo
            generateQRDataURL(tableUrl, 300).then(dataUrl => {
                console.log('QR Code generated successfully, starting download');
                downloadQR(dataUrl, tableName || 'Table-' + tableId);
            }).catch(error => {
                console.error('QR Code generation error:', error);
                alert('حدث خطأ في توليد QR Code');
            });
        } catch (error) {
            console.error('QR Code generation error:', error);
            alert('حدث خطأ في توليد QR Code');
        }
    });
}

function showLargeQR(tableId, tableUrl) {
    console.log('showLargeQR called with:', tableId, tableUrl);

    // Use the same waiting mechanism as initQRCodes
    waitForQRCode(function() {
        generateLargeQR(tableId, tableUrl);
    });
}

function generateLargeQR(tableId, url) {

    // Get table name from the row
    const tableRow = document.querySelector(`#qr-${tableId}`).closest('tr');
    if (!tableRow) {
        console.error('Table row not found for ID:', tableId);
        return;
    }
    const tableName = tableRow.querySelector('td:nth-child(2)').textContent;
    console.log('Table name:', tableName);

    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        max-width: 420px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    // Title with table info
    const title = document.createElement('h3');
    title.innerHTML = `<i class='bx bx-qr' style="margin-right: 10px; color: #007bff;"></i>QR Code بسيط للطاولة ${tableName}`;
    title.style.cssText = `
        color: #333;
        margin-bottom: 20px;
        font-size: 24px;
    `;
    modalContent.appendChild(title);

    // Table info
    const tableInfo = document.createElement('div');
    tableInfo.innerHTML = `
        <p style="color: #666; margin-bottom: 15px; font-size: 14px;">
            <strong>رابط الطاولة:</strong><br>
            <span style="font-size: 12px; word-break: break-all; background: #f8f9fa; padding: 5px; border-radius: 3px; display: inline-block; margin-top: 5px;">${tableUrl}</span>
        </p>
    `;
    modalContent.appendChild(tableInfo);

    const qrContainer = document.createElement('div');
    qrContainer.id = 'modal-qr-' + tableId;
    qrContainer.style.cssText = `
        margin: 20px 0;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 10px;
        border: 2px dashed #dee2e6;
    `;
    modalContent.appendChild(qrContainer);

    // QR Code info
    const qrInfo = document.createElement('p');
    qrInfo.innerHTML = 'QR Code بسيط للطاولة';
    qrInfo.style.cssText = `
        margin: 15px 0;
        text-align: center;
        font-weight: bold;
        color: #28a745;
    `;
    modalContent.appendChild(qrInfo);

    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
    `;

    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.innerHTML = `<i class='bx bx-download' style="margin-right: 5px;"></i>تحميل QR بسيط`;
    downloadBtn.style.cssText = `
        padding: 12px 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: background 0.3s;
    `;
    downloadBtn.onmouseover = () => downloadBtn.style.background = '#0056b3';
    downloadBtn.onmouseout = () => downloadBtn.style.background = '#007bff';

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = `<i class='bx bx-x' style="margin-right: 5px;"></i>إغلاق`;
    closeBtn.style.cssText = `
        padding: 12px 20px;
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: background 0.3s;
    `;
    closeBtn.onmouseover = () => closeBtn.style.background = '#c82333';
    closeBtn.onmouseout = () => closeBtn.style.background = '#dc3545';
    closeBtn.onclick = () => document.body.removeChild(modal);

    buttonContainer.appendChild(downloadBtn);
    buttonContainer.appendChild(closeBtn);
    modalContent.appendChild(buttonContainer);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    console.log('Modal added to body');

    // State variable
    let currentDataUrl = null;

    // Generate QR code with logo
    qrContainer.innerHTML = '<p style="color: #666;">جاري توليد QR Code...</p>';

    generateQRDataURL(url, 300).then(dataUrl => {
        console.log('QR Code generated successfully with logo');
        currentDataUrl = dataUrl;

        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.cssText = `
            width: 280px;
            height: 280px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        `;
        qrContainer.innerHTML = '';
        qrContainer.appendChild(img);
        console.log('QR Code image added to container');
    }).catch(error => {
        console.error('QR Code generation error:', error);
        qrContainer.innerHTML = '<p style="color: #dc3545;">حدث خطأ في توليد QR Code</p>';
    });

    // Set download functionality
    downloadBtn.onclick = () => {
        console.log('Download button clicked');
        if (currentDataUrl) {
            downloadQR(currentDataUrl, tableName);
        }
    };

    // Close modal when clicking outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    };
}

// Initialize QR codes after library is loaded
function initQRCodes() {
    if (typeof qrcode === 'undefined') {
        console.error('QRCode library not loaded');
        return;
    }

    // Generate QR codes for existing tables
    @foreach ($diningTable as $table)
        try {
            generateQRDataURL('{{ $table->encrypted_simple_url }}', 50).then(url => {
                const img = document.createElement('img');
                img.src = url;
                img.style.width = '60px';
                img.style.height = '60px';
                img.style.borderRadius = '8px';
                img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                const container = document.getElementById('qr-{{ $table->id }}');
                if (container) {
                    container.innerHTML = ''; // Clear existing content
                    container.appendChild(img);
                }
            }).catch(error => {
                console.error('QR Error for table {{ $table->id }}:', error);
            });
        } catch (error) {
            console.error('QR Error for table {{ $table->id }}:', error);
        }
    @endforeach

    // Generate QR for newly created table if exists
    @if (session('new_table_id') && session('table_link'))
        try {
            generateQRDataURL('{{ session('table_link') }}', 150).then(url => {
                const img = document.createElement('img');
                img.src = url;
                img.style.width = '200px';
                img.style.height = '200px';
                img.style.borderRadius = '12px';
                img.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                const container = document.getElementById('qrcode-{{ session('new_table_id') }}');
                if (container) {
                    container.innerHTML = ''; // Clear existing content
                    container.appendChild(img);
                }
            }).catch(error => {
                console.error('QR Error for new table:', error);
            });
        } catch (error) {
            console.error('QR Error for new table:', error);
        }
    @endif
}
</script>

@endsection
