// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_branch_profile.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PublicBranchProfile extends PublicBranchProfile {
  @override
  final String slug;
  @override
  final String area;
  @override
  final String city;
  @override
  final String address;
  @override
  final num? latitude;
  @override
  final num? longitude;
  @override
  final BuiltList<PublicBranchProfileOpeningHoursInner> openingHours;
  @override
  final String description;
  @override
  final String? arrivalInformation;
  @override
  final String? parkingInformation;
  @override
  final BuiltList<String> amenities;
  @override
  final String heroImageKey;
  @override
  final BuiltList<String> galleryImageKeys;

  factory _$PublicBranchProfile([
    void Function(PublicBranchProfileBuilder)? updates,
  ]) => (PublicBranchProfileBuilder()..update(updates))._build();

  _$PublicBranchProfile._({
    required this.slug,
    required this.area,
    required this.city,
    required this.address,
    this.latitude,
    this.longitude,
    required this.openingHours,
    required this.description,
    this.arrivalInformation,
    this.parkingInformation,
    required this.amenities,
    required this.heroImageKey,
    required this.galleryImageKeys,
  }) : super._();
  @override
  PublicBranchProfile rebuild(
    void Function(PublicBranchProfileBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PublicBranchProfileBuilder toBuilder() =>
      PublicBranchProfileBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicBranchProfile &&
        slug == other.slug &&
        area == other.area &&
        city == other.city &&
        address == other.address &&
        latitude == other.latitude &&
        longitude == other.longitude &&
        openingHours == other.openingHours &&
        description == other.description &&
        arrivalInformation == other.arrivalInformation &&
        parkingInformation == other.parkingInformation &&
        amenities == other.amenities &&
        heroImageKey == other.heroImageKey &&
        galleryImageKeys == other.galleryImageKeys;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, slug.hashCode);
    _$hash = $jc(_$hash, area.hashCode);
    _$hash = $jc(_$hash, city.hashCode);
    _$hash = $jc(_$hash, address.hashCode);
    _$hash = $jc(_$hash, latitude.hashCode);
    _$hash = $jc(_$hash, longitude.hashCode);
    _$hash = $jc(_$hash, openingHours.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, arrivalInformation.hashCode);
    _$hash = $jc(_$hash, parkingInformation.hashCode);
    _$hash = $jc(_$hash, amenities.hashCode);
    _$hash = $jc(_$hash, heroImageKey.hashCode);
    _$hash = $jc(_$hash, galleryImageKeys.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PublicBranchProfile')
          ..add('slug', slug)
          ..add('area', area)
          ..add('city', city)
          ..add('address', address)
          ..add('latitude', latitude)
          ..add('longitude', longitude)
          ..add('openingHours', openingHours)
          ..add('description', description)
          ..add('arrivalInformation', arrivalInformation)
          ..add('parkingInformation', parkingInformation)
          ..add('amenities', amenities)
          ..add('heroImageKey', heroImageKey)
          ..add('galleryImageKeys', galleryImageKeys))
        .toString();
  }
}

class PublicBranchProfileBuilder
    implements Builder<PublicBranchProfile, PublicBranchProfileBuilder> {
  _$PublicBranchProfile? _$v;

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

  num? _latitude;
  num? get latitude => _$this._latitude;
  set latitude(num? latitude) => _$this._latitude = latitude;

  num? _longitude;
  num? get longitude => _$this._longitude;
  set longitude(num? longitude) => _$this._longitude = longitude;

  ListBuilder<PublicBranchProfileOpeningHoursInner>? _openingHours;
  ListBuilder<PublicBranchProfileOpeningHoursInner> get openingHours =>
      _$this._openingHours ??=
          ListBuilder<PublicBranchProfileOpeningHoursInner>();
  set openingHours(
    ListBuilder<PublicBranchProfileOpeningHoursInner>? openingHours,
  ) => _$this._openingHours = openingHours;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  String? _arrivalInformation;
  String? get arrivalInformation => _$this._arrivalInformation;
  set arrivalInformation(String? arrivalInformation) =>
      _$this._arrivalInformation = arrivalInformation;

  String? _parkingInformation;
  String? get parkingInformation => _$this._parkingInformation;
  set parkingInformation(String? parkingInformation) =>
      _$this._parkingInformation = parkingInformation;

  ListBuilder<String>? _amenities;
  ListBuilder<String> get amenities =>
      _$this._amenities ??= ListBuilder<String>();
  set amenities(ListBuilder<String>? amenities) =>
      _$this._amenities = amenities;

  String? _heroImageKey;
  String? get heroImageKey => _$this._heroImageKey;
  set heroImageKey(String? heroImageKey) => _$this._heroImageKey = heroImageKey;

  ListBuilder<String>? _galleryImageKeys;
  ListBuilder<String> get galleryImageKeys =>
      _$this._galleryImageKeys ??= ListBuilder<String>();
  set galleryImageKeys(ListBuilder<String>? galleryImageKeys) =>
      _$this._galleryImageKeys = galleryImageKeys;

  PublicBranchProfileBuilder() {
    PublicBranchProfile._defaults(this);
  }

  PublicBranchProfileBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _slug = $v.slug;
      _area = $v.area;
      _city = $v.city;
      _address = $v.address;
      _latitude = $v.latitude;
      _longitude = $v.longitude;
      _openingHours = $v.openingHours.toBuilder();
      _description = $v.description;
      _arrivalInformation = $v.arrivalInformation;
      _parkingInformation = $v.parkingInformation;
      _amenities = $v.amenities.toBuilder();
      _heroImageKey = $v.heroImageKey;
      _galleryImageKeys = $v.galleryImageKeys.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PublicBranchProfile other) {
    _$v = other as _$PublicBranchProfile;
  }

  @override
  void update(void Function(PublicBranchProfileBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicBranchProfile build() => _build();

  _$PublicBranchProfile _build() {
    _$PublicBranchProfile _$result;
    try {
      _$result =
          _$v ??
          _$PublicBranchProfile._(
            slug: BuiltValueNullFieldError.checkNotNull(
              slug,
              r'PublicBranchProfile',
              'slug',
            ),
            area: BuiltValueNullFieldError.checkNotNull(
              area,
              r'PublicBranchProfile',
              'area',
            ),
            city: BuiltValueNullFieldError.checkNotNull(
              city,
              r'PublicBranchProfile',
              'city',
            ),
            address: BuiltValueNullFieldError.checkNotNull(
              address,
              r'PublicBranchProfile',
              'address',
            ),
            latitude: latitude,
            longitude: longitude,
            openingHours: openingHours.build(),
            description: BuiltValueNullFieldError.checkNotNull(
              description,
              r'PublicBranchProfile',
              'description',
            ),
            arrivalInformation: arrivalInformation,
            parkingInformation: parkingInformation,
            amenities: amenities.build(),
            heroImageKey: BuiltValueNullFieldError.checkNotNull(
              heroImageKey,
              r'PublicBranchProfile',
              'heroImageKey',
            ),
            galleryImageKeys: galleryImageKeys.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'openingHours';
        openingHours.build();

        _$failedField = 'amenities';
        amenities.build();

        _$failedField = 'galleryImageKeys';
        galleryImageKeys.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PublicBranchProfile',
          _$failedField,
          e.toString(),
        );
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
