// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_catalog_range.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PublicCatalogRange extends PublicCatalogRange {
  @override
  final DateTime from;
  @override
  final DateTime until;

  factory _$PublicCatalogRange([
    void Function(PublicCatalogRangeBuilder)? updates,
  ]) => (PublicCatalogRangeBuilder()..update(updates))._build();

  _$PublicCatalogRange._({required this.from, required this.until}) : super._();
  @override
  PublicCatalogRange rebuild(
    void Function(PublicCatalogRangeBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PublicCatalogRangeBuilder toBuilder() =>
      PublicCatalogRangeBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicCatalogRange &&
        from == other.from &&
        until == other.until;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, from.hashCode);
    _$hash = $jc(_$hash, until.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PublicCatalogRange')
          ..add('from', from)
          ..add('until', until))
        .toString();
  }
}

class PublicCatalogRangeBuilder
    implements Builder<PublicCatalogRange, PublicCatalogRangeBuilder> {
  _$PublicCatalogRange? _$v;

  DateTime? _from;
  DateTime? get from => _$this._from;
  set from(DateTime? from) => _$this._from = from;

  DateTime? _until;
  DateTime? get until => _$this._until;
  set until(DateTime? until) => _$this._until = until;

  PublicCatalogRangeBuilder() {
    PublicCatalogRange._defaults(this);
  }

  PublicCatalogRangeBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _from = $v.from;
      _until = $v.until;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PublicCatalogRange other) {
    _$v = other as _$PublicCatalogRange;
  }

  @override
  void update(void Function(PublicCatalogRangeBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicCatalogRange build() => _build();

  _$PublicCatalogRange _build() {
    final _$result =
        _$v ??
        _$PublicCatalogRange._(
          from: BuiltValueNullFieldError.checkNotNull(
            from,
            r'PublicCatalogRange',
            'from',
          ),
          until: BuiltValueNullFieldError.checkNotNull(
            until,
            r'PublicCatalogRange',
            'until',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
