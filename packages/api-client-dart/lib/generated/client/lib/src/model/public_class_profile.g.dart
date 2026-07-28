// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_class_profile.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

abstract mixin class PublicClassProfileBuilder {
  void replace(PublicClassProfile other);
  void update(void Function(PublicClassProfileBuilder) updates);
  String? get code;
  set code(String? code);

  String? get slug;
  set slug(String? slug);

  String? get summary;
  set summary(String? summary);

  String? get description;
  set description(String? description);

  String? get level;
  set level(String? level);

  int? get durationMinutes;
  set durationMinutes(int? durationMinutes);

  ListBuilder<String> get equipment;
  set equipment(ListBuilder<String>? equipment);

  ListBuilder<String> get benefits;
  set benefits(ListBuilder<String>? benefits);

  String? get heroImageKey;
  set heroImageKey(String? heroImageKey);
}

class _$$PublicClassProfile extends $PublicClassProfile {
  @override
  final String code;
  @override
  final String slug;
  @override
  final String summary;
  @override
  final String description;
  @override
  final String level;
  @override
  final int durationMinutes;
  @override
  final BuiltList<String> equipment;
  @override
  final BuiltList<String> benefits;
  @override
  final String heroImageKey;

  factory _$$PublicClassProfile([
    void Function($PublicClassProfileBuilder)? updates,
  ]) => ($PublicClassProfileBuilder()..update(updates))._build();

  _$$PublicClassProfile._({
    required this.code,
    required this.slug,
    required this.summary,
    required this.description,
    required this.level,
    required this.durationMinutes,
    required this.equipment,
    required this.benefits,
    required this.heroImageKey,
  }) : super._();
  @override
  $PublicClassProfile rebuild(
    void Function($PublicClassProfileBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  $PublicClassProfileBuilder toBuilder() =>
      $PublicClassProfileBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is $PublicClassProfile &&
        code == other.code &&
        slug == other.slug &&
        summary == other.summary &&
        description == other.description &&
        level == other.level &&
        durationMinutes == other.durationMinutes &&
        equipment == other.equipment &&
        benefits == other.benefits &&
        heroImageKey == other.heroImageKey;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, slug.hashCode);
    _$hash = $jc(_$hash, summary.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, level.hashCode);
    _$hash = $jc(_$hash, durationMinutes.hashCode);
    _$hash = $jc(_$hash, equipment.hashCode);
    _$hash = $jc(_$hash, benefits.hashCode);
    _$hash = $jc(_$hash, heroImageKey.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'$PublicClassProfile')
          ..add('code', code)
          ..add('slug', slug)
          ..add('summary', summary)
          ..add('description', description)
          ..add('level', level)
          ..add('durationMinutes', durationMinutes)
          ..add('equipment', equipment)
          ..add('benefits', benefits)
          ..add('heroImageKey', heroImageKey))
        .toString();
  }
}

class $PublicClassProfileBuilder
    implements
        Builder<$PublicClassProfile, $PublicClassProfileBuilder>,
        PublicClassProfileBuilder {
  _$$PublicClassProfile? _$v;

  String? _code;
  String? get code => _$this._code;
  set code(covariant String? code) => _$this._code = code;

  String? _slug;
  String? get slug => _$this._slug;
  set slug(covariant String? slug) => _$this._slug = slug;

  String? _summary;
  String? get summary => _$this._summary;
  set summary(covariant String? summary) => _$this._summary = summary;

  String? _description;
  String? get description => _$this._description;
  set description(covariant String? description) =>
      _$this._description = description;

  String? _level;
  String? get level => _$this._level;
  set level(covariant String? level) => _$this._level = level;

  int? _durationMinutes;
  int? get durationMinutes => _$this._durationMinutes;
  set durationMinutes(covariant int? durationMinutes) =>
      _$this._durationMinutes = durationMinutes;

  ListBuilder<String>? _equipment;
  ListBuilder<String> get equipment =>
      _$this._equipment ??= ListBuilder<String>();
  set equipment(covariant ListBuilder<String>? equipment) =>
      _$this._equipment = equipment;

  ListBuilder<String>? _benefits;
  ListBuilder<String> get benefits =>
      _$this._benefits ??= ListBuilder<String>();
  set benefits(covariant ListBuilder<String>? benefits) =>
      _$this._benefits = benefits;

  String? _heroImageKey;
  String? get heroImageKey => _$this._heroImageKey;
  set heroImageKey(covariant String? heroImageKey) =>
      _$this._heroImageKey = heroImageKey;

  $PublicClassProfileBuilder() {
    $PublicClassProfile._defaults(this);
  }

  $PublicClassProfileBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _code = $v.code;
      _slug = $v.slug;
      _summary = $v.summary;
      _description = $v.description;
      _level = $v.level;
      _durationMinutes = $v.durationMinutes;
      _equipment = $v.equipment.toBuilder();
      _benefits = $v.benefits.toBuilder();
      _heroImageKey = $v.heroImageKey;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant $PublicClassProfile other) {
    _$v = other as _$$PublicClassProfile;
  }

  @override
  void update(void Function($PublicClassProfileBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  $PublicClassProfile build() => _build();

  _$$PublicClassProfile _build() {
    _$$PublicClassProfile _$result;
    try {
      _$result =
          _$v ??
          _$$PublicClassProfile._(
            code: BuiltValueNullFieldError.checkNotNull(
              code,
              r'$PublicClassProfile',
              'code',
            ),
            slug: BuiltValueNullFieldError.checkNotNull(
              slug,
              r'$PublicClassProfile',
              'slug',
            ),
            summary: BuiltValueNullFieldError.checkNotNull(
              summary,
              r'$PublicClassProfile',
              'summary',
            ),
            description: BuiltValueNullFieldError.checkNotNull(
              description,
              r'$PublicClassProfile',
              'description',
            ),
            level: BuiltValueNullFieldError.checkNotNull(
              level,
              r'$PublicClassProfile',
              'level',
            ),
            durationMinutes: BuiltValueNullFieldError.checkNotNull(
              durationMinutes,
              r'$PublicClassProfile',
              'durationMinutes',
            ),
            equipment: equipment.build(),
            benefits: benefits.build(),
            heroImageKey: BuiltValueNullFieldError.checkNotNull(
              heroImageKey,
              r'$PublicClassProfile',
              'heroImageKey',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'equipment';
        equipment.build();
        _$failedField = 'benefits';
        benefits.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'$PublicClassProfile',
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
