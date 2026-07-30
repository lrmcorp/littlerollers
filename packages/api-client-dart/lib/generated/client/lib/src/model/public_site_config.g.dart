// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_site_config.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PublicSiteConfig extends PublicSiteConfig {
  @override
  final BuiltList<PublicBranch> branches;
  @override
  final BuiltList<PublicClassMarketingSummary> classes;
  @override
  final String? fallbackWhatsappE164;
  @override
  final MobileFeatures mobileFeatures;

  factory _$PublicSiteConfig([
    void Function(PublicSiteConfigBuilder)? updates,
  ]) => (PublicSiteConfigBuilder()..update(updates))._build();

  _$PublicSiteConfig._({
    required this.branches,
    required this.classes,
    this.fallbackWhatsappE164,
    required this.mobileFeatures,
  }) : super._();
  @override
  PublicSiteConfig rebuild(void Function(PublicSiteConfigBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PublicSiteConfigBuilder toBuilder() =>
      PublicSiteConfigBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicSiteConfig &&
        branches == other.branches &&
        classes == other.classes &&
        fallbackWhatsappE164 == other.fallbackWhatsappE164 &&
        mobileFeatures == other.mobileFeatures;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, branches.hashCode);
    _$hash = $jc(_$hash, classes.hashCode);
    _$hash = $jc(_$hash, fallbackWhatsappE164.hashCode);
    _$hash = $jc(_$hash, mobileFeatures.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PublicSiteConfig')
          ..add('branches', branches)
          ..add('classes', classes)
          ..add('fallbackWhatsappE164', fallbackWhatsappE164)
          ..add('mobileFeatures', mobileFeatures))
        .toString();
  }
}

class PublicSiteConfigBuilder
    implements Builder<PublicSiteConfig, PublicSiteConfigBuilder> {
  _$PublicSiteConfig? _$v;

  ListBuilder<PublicBranch>? _branches;
  ListBuilder<PublicBranch> get branches =>
      _$this._branches ??= ListBuilder<PublicBranch>();
  set branches(ListBuilder<PublicBranch>? branches) =>
      _$this._branches = branches;

  ListBuilder<PublicClassMarketingSummary>? _classes;
  ListBuilder<PublicClassMarketingSummary> get classes =>
      _$this._classes ??= ListBuilder<PublicClassMarketingSummary>();
  set classes(ListBuilder<PublicClassMarketingSummary>? classes) =>
      _$this._classes = classes;

  String? _fallbackWhatsappE164;
  String? get fallbackWhatsappE164 => _$this._fallbackWhatsappE164;
  set fallbackWhatsappE164(String? fallbackWhatsappE164) =>
      _$this._fallbackWhatsappE164 = fallbackWhatsappE164;

  MobileFeaturesBuilder? _mobileFeatures;
  MobileFeaturesBuilder get mobileFeatures =>
      _$this._mobileFeatures ??= MobileFeaturesBuilder();
  set mobileFeatures(MobileFeaturesBuilder? mobileFeatures) =>
      _$this._mobileFeatures = mobileFeatures;

  PublicSiteConfigBuilder() {
    PublicSiteConfig._defaults(this);
  }

  PublicSiteConfigBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _branches = $v.branches.toBuilder();
      _classes = $v.classes.toBuilder();
      _fallbackWhatsappE164 = $v.fallbackWhatsappE164;
      _mobileFeatures = $v.mobileFeatures.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PublicSiteConfig other) {
    _$v = other as _$PublicSiteConfig;
  }

  @override
  void update(void Function(PublicSiteConfigBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicSiteConfig build() => _build();

  _$PublicSiteConfig _build() {
    _$PublicSiteConfig _$result;
    try {
      _$result =
          _$v ??
          _$PublicSiteConfig._(
            branches: branches.build(),
            classes: classes.build(),
            fallbackWhatsappE164: fallbackWhatsappE164,
            mobileFeatures: mobileFeatures.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'branches';
        branches.build();
        _$failedField = 'classes';
        classes.build();

        _$failedField = 'mobileFeatures';
        mobileFeatures.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PublicSiteConfig',
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
