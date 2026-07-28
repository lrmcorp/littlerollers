// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_package_profile.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PublicPackageProfile extends PublicPackageProfile {
  @override
  final String summary;
  @override
  final String description;
  @override
  final BuiltList<String> highlights;
  @override
  final String usageGuidance;
  @override
  final BuiltList<String> terms;

  factory _$PublicPackageProfile([
    void Function(PublicPackageProfileBuilder)? updates,
  ]) => (PublicPackageProfileBuilder()..update(updates))._build();

  _$PublicPackageProfile._({
    required this.summary,
    required this.description,
    required this.highlights,
    required this.usageGuidance,
    required this.terms,
  }) : super._();
  @override
  PublicPackageProfile rebuild(
    void Function(PublicPackageProfileBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PublicPackageProfileBuilder toBuilder() =>
      PublicPackageProfileBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicPackageProfile &&
        summary == other.summary &&
        description == other.description &&
        highlights == other.highlights &&
        usageGuidance == other.usageGuidance &&
        terms == other.terms;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, summary.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, highlights.hashCode);
    _$hash = $jc(_$hash, usageGuidance.hashCode);
    _$hash = $jc(_$hash, terms.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PublicPackageProfile')
          ..add('summary', summary)
          ..add('description', description)
          ..add('highlights', highlights)
          ..add('usageGuidance', usageGuidance)
          ..add('terms', terms))
        .toString();
  }
}

class PublicPackageProfileBuilder
    implements Builder<PublicPackageProfile, PublicPackageProfileBuilder> {
  _$PublicPackageProfile? _$v;

  String? _summary;
  String? get summary => _$this._summary;
  set summary(String? summary) => _$this._summary = summary;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  ListBuilder<String>? _highlights;
  ListBuilder<String> get highlights =>
      _$this._highlights ??= ListBuilder<String>();
  set highlights(ListBuilder<String>? highlights) =>
      _$this._highlights = highlights;

  String? _usageGuidance;
  String? get usageGuidance => _$this._usageGuidance;
  set usageGuidance(String? usageGuidance) =>
      _$this._usageGuidance = usageGuidance;

  ListBuilder<String>? _terms;
  ListBuilder<String> get terms => _$this._terms ??= ListBuilder<String>();
  set terms(ListBuilder<String>? terms) => _$this._terms = terms;

  PublicPackageProfileBuilder() {
    PublicPackageProfile._defaults(this);
  }

  PublicPackageProfileBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _summary = $v.summary;
      _description = $v.description;
      _highlights = $v.highlights.toBuilder();
      _usageGuidance = $v.usageGuidance;
      _terms = $v.terms.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PublicPackageProfile other) {
    _$v = other as _$PublicPackageProfile;
  }

  @override
  void update(void Function(PublicPackageProfileBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicPackageProfile build() => _build();

  _$PublicPackageProfile _build() {
    _$PublicPackageProfile _$result;
    try {
      _$result =
          _$v ??
          _$PublicPackageProfile._(
            summary: BuiltValueNullFieldError.checkNotNull(
              summary,
              r'PublicPackageProfile',
              'summary',
            ),
            description: BuiltValueNullFieldError.checkNotNull(
              description,
              r'PublicPackageProfile',
              'description',
            ),
            highlights: highlights.build(),
            usageGuidance: BuiltValueNullFieldError.checkNotNull(
              usageGuidance,
              r'PublicPackageProfile',
              'usageGuidance',
            ),
            terms: terms.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'highlights';
        highlights.build();

        _$failedField = 'terms';
        terms.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PublicPackageProfile',
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
