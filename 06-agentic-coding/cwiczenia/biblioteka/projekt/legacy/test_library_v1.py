from library_v1 import _fmt, _parse, calculate_fine


def test_no_fine_when_on_time():
    assert calculate_fine(0) == 0.0


def test_fine_three_days():
    assert calculate_fine(3) == 0.3


def test_date_roundtrip():
    assert _fmt(_parse("01.02.2023")) == "01.02.2023"
