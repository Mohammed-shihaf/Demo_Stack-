from app.domain.services.legacy_export_service import LegacyExportService


def test_legacy_export_service_is_importable():
    assert hasattr(LegacyExportService, "to_csv")
    assert hasattr(LegacyExportService, "to_fixed_width")
    assert hasattr(LegacyExportService, "summarise")
