$cp1251 = [Text.Encoding]::GetEncoding(1251)
$utf8 = [Text.Encoding]::UTF8
$file = Join-Path (Get-Location) "src\data\recipes.parsed.json"

function Repair-String([string]$value) {
  $hasReplacement = $value.Contains([char]0xfffd)
  $hasBrokenMarker = $value -match "[\u0403\u0402\u040c\u040b\u0406\u0407\u0454]|\u0432\u0402|\u0433\u0403|\u0434\u00bb|\u0437\u2026"
  $cyrillicMarkerCount = ([regex]::Matches($value, "[\u0420\u0421]")).Count

  if ($hasReplacement -or $hasBrokenMarker -or $cyrillicMarkerCount -ge 2) {
    return $utf8.GetString($cp1251.GetBytes($value))
  }

  return $value
}

function Repair-Value($value) {
  if ($null -eq $value) { return $null }
  if ($value -is [string]) { return (Repair-String $value) }
  if ($value -is [System.Collections.IList]) {
    if ($value.Count -gt 0) {
      foreach ($index in 0..($value.Count - 1)) {
        $value[$index] = Repair-Value $value[$index]
      }
    }
    return $value
  }
  if ($value -is [pscustomobject]) {
    foreach ($property in $value.PSObject.Properties) {
      $property.Value = Repair-Value $property.Value
    }
  }
  return $value
}

$data = Get-Content -LiteralPath $file -Raw | ConvertFrom-Json
$data = Repair-Value $data
$data | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $file -Encoding utf8
