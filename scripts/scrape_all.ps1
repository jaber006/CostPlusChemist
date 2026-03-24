# Sigma Connect Catalog Scraper
# Uses openclaw browser (already logged in) to scrape all OTC categories

$dataDir = "C:\Users\MJ\projects\CostPlusChemist\data"
$allProducts = @()
$targetId = $args[0]  # Browser tab targetId passed as argument

# All OTC parent category URLs
$categories = @(
    # Medicines OTC
    "https://www.sigmaconnect.com.au/c/Product/Medicines-OTC-and-FOS/Allergy-and-Hayfever/c/10003001",
    "https://www.sigmaconnect.com.au/c/Product/Medicines-OTC-and-FOS/Childrens-Health/c/10003003",
    "https://www.sigmaconnect.com.au/c/Product/Medicines-OTC-and-FOS/Cough-and-Cold/c/10003016",
    "https://www.sigmaconnect.com.au/c/Product/Medicines-OTC-and-FOS/Eye-and-Ear/c/10003006",
    "https://www.sigmaconnect.com.au/c/Product/Medicines-OTC-and-FOS/First-Aid-and-Wound-Care/c/10003015",
    "https://www.sigmaconnect.com.au/c/Product/Medicines-OTC-and-FOS/General-Otc-S3/c/10003017",
    "https://www.sigmaconnect.com.au/c/Product/Medicines-OTC-and-FOS/Pain-Relief/c/10003008",
    "https://www.sigmaconnect.com.au/c/Product/Medicines-OTC-and-FOS/Sleeping-Aids/c/10003011",
    "https://www.sigmaconnect.com.au/c/Product/Medicines-OTC-and-FOS/Smoking-Cessation/c/10003012",
    "https://www.sigmaconnect.com.au/c/Product/Medicines-OTC-and-FOS/Viral-and-Antifungal/c/10003014",
    # Health and Wellbeing
    "https://www.sigmaconnect.com.au/c/Product/Health-and-Wellbeing/Digestive-Health/c/10004007",
    "https://www.sigmaconnect.com.au/c/Product/Health-and-Wellbeing/Health-Management/c/10004001",
    "https://www.sigmaconnect.com.au/c/Product/Health-and-Wellbeing/Medical-Aids/c/10004002",
    "https://www.sigmaconnect.com.au/c/Product/Health-and-Wellbeing/Natural-Medicine/c/10004003",
    "https://www.sigmaconnect.com.au/c/Product/Health-and-Wellbeing/Nutrition/c/10004004",
    "https://www.sigmaconnect.com.au/c/Product/Health-and-Wellbeing/Sports-Medicine/c/10004006",
    "https://www.sigmaconnect.com.au/c/Product/Health-and-Wellbeing/Weight-Management/c/10004005",
    # Beauty Skincare
    "https://www.sigmaconnect.com.au/c/Product/Beauty-Skincare-and-Haircare/Cosmetics/c/10005001",
    "https://www.sigmaconnect.com.au/c/Product/Beauty-Skincare-and-Haircare/Cotton/c/10005025",
    "https://www.sigmaconnect.com.au/c/Product/Beauty-Skincare-and-Haircare/Gifting-And-Promotion/c/10005026",
    "https://www.sigmaconnect.com.au/c/Product/Beauty-Skincare-and-Haircare/Hair-Care/c/10005002",
    "https://www.sigmaconnect.com.au/c/Product/Beauty-Skincare-and-Haircare/Medicated-Hair-Care/c/10005003",
    "https://www.sigmaconnect.com.au/c/Product/Beauty-Skincare-and-Haircare/Medicated-Skin/c/10005004",
    "https://www.sigmaconnect.com.au/c/Product/Beauty-Skincare-and-Haircare/Skincare/c/10005005",
    "https://www.sigmaconnect.com.au/c/Product/Beauty-Skincare-and-Haircare/Suncare/c/10005006",
    # Personal Care
    "https://www.sigmaconnect.com.au/c/Product/Personal-Care/Aromatherapy/c/10006010",
    "https://www.sigmaconnect.com.au/c/Product/Personal-Care/Deodorant/c/10006001",
    "https://www.sigmaconnect.com.au/c/Product/Personal-Care/Depilatory/c/10006002",
    "https://www.sigmaconnect.com.au/c/Product/Personal-Care/Family-Planning/c/10006003",
    "https://www.sigmaconnect.com.au/c/Product/Personal-Care/Feminine-Hygiene/c/10006004",
    "https://www.sigmaconnect.com.au/c/Product/Personal-Care/Men-Toiletries/c/10006007",
    "https://www.sigmaconnect.com.au/c/Product/Personal-Care/Oral-Care/c/10006009",
    "https://www.sigmaconnect.com.au/c/Product/Personal-Care/Soaps-and-Bath/c/10006008",
    # General Merchandise and Baby
    "https://www.sigmaconnect.com.au/c/Product/General-Merchandise-and-Baby/Baby/c/10008001",
    "https://www.sigmaconnect.com.au/c/Product/General-Merchandise-and-Baby/Batteries/c/10008002",
    "https://www.sigmaconnect.com.au/c/Product/General-Merchandise-and-Baby/Food-and-Drink/c/10008005",
    "https://www.sigmaconnect.com.au/c/Product/General-Merchandise-and-Baby/Footcare/c/10008006",
    "https://www.sigmaconnect.com.au/c/Product/General-Merchandise-and-Baby/Household-and-Domestic/c/10008007",
    "https://www.sigmaconnect.com.au/c/Product/General-Merchandise-and-Baby/Incontinence/c/10008009",
    "https://www.sigmaconnect.com.au/c/Product/General-Merchandise-and-Baby/Independent-Living/c/10008008",
    "https://www.sigmaconnect.com.au/c/Product/General-Merchandise-and-Baby/Travel/c/10008010"
)

Write-Host "Starting scrape of $($categories.Count) categories..."
Write-Host "Target ID: $targetId"

$catIndex = 0
foreach ($catUrl in $categories) {
    $catIndex++
    $catName = ($catUrl -split '/c/')[0] -split '/' | Select-Object -Last 1
    Write-Host "`n[$catIndex/$($categories.Count)] $catName"
    
    $pageUrl = "$catUrl`?resultPerPage=50"
    $pageNum = 0
    $catProducts = @()
    
    do {
        $pageNum++
        Write-Host "  Page $pageNum... " -NoNewline
        
        # Output the URL for the parent process to navigate to
        Write-Host "URL:$pageUrl"
        
        # Signal we need navigation + extraction
        Write-Host "EXTRACT_PAGE"
        
        # Wait for input (the extracted JSON)
        $json = Read-Host
        
        if ($json -eq "ERROR" -or [string]::IsNullOrEmpty($json)) {
            Write-Host "  Error on page, skipping"
            break
        }
        
        $data = $json | ConvertFrom-Json
        Write-Host "$($data.count) products"
        
        foreach ($p in $data.products) {
            $p | Add-Member -NotePropertyName "category" -NotePropertyValue $catName -Force
        }
        
        $catProducts += $data.products
        $hasNext = $data.hasNext
        $pageUrl = $data.nextUrl
        
        Start-Sleep -Seconds 1
        
    } while ($hasNext -and $pageUrl)
    
    Write-Host "  Category total: $($catProducts.Count) products"
    $allProducts += $catProducts
    
    # Save progress after each category
    $allProducts | ConvertTo-Json -Depth 5 | Set-Content "$dataDir\sigma_catalog.json"
    Write-Host "  Saved ($($allProducts.Count) total so far)"
}

Write-Host "`n=== COMPLETE ==="
Write-Host "Total products scraped: $($allProducts.Count)"
