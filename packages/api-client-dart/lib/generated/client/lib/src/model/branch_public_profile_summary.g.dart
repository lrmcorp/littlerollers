// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_public_profile_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BranchPublicProfileSummary extends BranchPublicProfileSummary {
  @override
  final String slug;
  @override
  final String area;
  @override
  final String city;
  @override
  final String? address;

  factory _$BranchPublicProfileSummary([
    void Function(BranchPublicProfileSummaryBuilder)? updates,
  ]) => (BranchPublicProfileSummaryBuilder()..update(updates))._build();

  _$BranchPublicProfileSummary._({
    required this.slug,
    required this.area,
    required this.city,
    this.address,
  }) : super._();
  @override
  BranchPublicProfileSummary rebuild(
    void Function(BranchPublicProfileSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  BranchPublicProfileSummaryBuilder toBuilder() =>
      BranchPublicProfileSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BranchPublicProfileSummary &&
        slug == other.slug &&
        area == other.area &&
        city == other.city &&
        address == other.address;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, slug.hashCode);
    _$hash = $jc(_$hash, area.hashCode);
    _$hash = $jc(_$hash, city.hashCode);
    _$hash = $jc(_$hash, address.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BranchPublicProfileSummary')
          ..add('slug', slug)
          ..add('area', area)
          ..add('city', city)
          ..add('address', address))
        .toString();
  }
}

class BranchPublicProfileSummaryBuilder
    implements
        Builder<BranchPublicProfileSummary, BranchPublicProfileSummaryBuilder> {
  _$BranchPublicProfileSummary? _$v;

  String? _slug;
  String? get slug => _$this._slug;
  set slug(String? slug) => _$this._slug = slug;

  String? _area;
  String? get area => _$this._area;
  set area(String? area) => _$this._area = area;

  String? _city;
  String? get city => _$this._city;
  set city(String? city) => _$this._city = city;

  String? _address;
  String? get address => _$this._address;
  set address(String? address) => _$this._address = address;

  BranchPublicProfileSummaryBuilder() {
    BranchPublicProfileSummary._defaults(this);
  }

  BranchPublicProfileSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _slug = $v.slug;
      _area = $v.area;
      _city = $v.city;
      _address = $v.address;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BranchPublicProfileSummary other) {
    _$v = other as _$BranchPublicProfileSummary;
  }

  @override
  void update(void Function(BranchPublicProfileSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BranchPublicProfileSummary build() => _build();

  _$BranchPublicProfileSummary _build() {
    final _$result =
        _$v ??
        _$BranchPublicProfileSummary._(
          slug: BuiltValueNullFieldError.checkNotNull(
            slug,
            r'BranchPublicProfileSummary',
            'slug',
          ),
          area: BuiltValueNullFieldError.checkNotNull(
            area,
            r'BranchPublicProfileSummary',
            'area',
          ),
          city: BuiltValueNullFieldError.checkNotNull(
            city,
            r'BranchPublicProfileSummary',
            'city',
          ),
          address: address,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
