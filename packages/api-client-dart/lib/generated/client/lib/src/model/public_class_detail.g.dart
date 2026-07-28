// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_class_detail.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PublicClassDetail extends PublicClassDetail {
  @override
  final PublicClassProfile profile;
  @override
  final BuiltList<PublicBranch> studios;
  @override
  final BuiltList<PublicPackageSummary> packages;
  @override
  final BuiltList<PublicScheduleSummary> schedules;

  factory _$PublicClassDetail([
    void Function(PublicClassDetailBuilder)? updates,
  ]) => (PublicClassDetailBuilder()..update(updates))._build();

  _$PublicClassDetail._({
    required this.profile,
    required this.studios,
    required this.packages,
    required this.schedules,
  }) : super._();
  @override
  PublicClassDetail rebuild(void Function(PublicClassDetailBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PublicClassDetailBuilder toBuilder() =>
      PublicClassDetailBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicClassDetail &&
        profile == other.profile &&
        studios == other.studios &&
        packages == other.packages &&
        schedules == other.schedules;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, profile.hashCode);
    _$hash = $jc(_$hash, studios.hashCode);
    _$hash = $jc(_$hash, packages.hashCode);
    _$hash = $jc(_$hash, schedules.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PublicClassDetail')
          ..add('profile', profile)
          ..add('studios', studios)
          ..add('packages', packages)
          ..add('schedules', schedules))
        .toString();
  }
}

class PublicClassDetailBuilder
    implements Builder<PublicClassDetail, PublicClassDetailBuilder> {
  _$PublicClassDetail? _$v;

  PublicClassProfile? _profile;
  PublicClassProfile? get profile => _$this._profile;
  set profile(PublicClassProfile? profile) => _$this._profile = profile;

  ListBuilder<PublicBranch>? _studios;
  ListBuilder<PublicBranch> get studios =>
      _$this._studios ??= ListBuilder<PublicBranch>();
  set studios(ListBuilder<PublicBranch>? studios) => _$this._studios = studios;

  ListBuilder<PublicPackageSummary>? _packages;
  ListBuilder<PublicPackageSummary> get packages =>
      _$this._packages ??= ListBuilder<PublicPackageSummary>();
  set packages(ListBuilder<PublicPackageSummary>? packages) =>
      _$this._packages = packages;

  ListBuilder<PublicScheduleSummary>? _schedules;
  ListBuilder<PublicScheduleSummary> get schedules =>
      _$this._schedules ??= ListBuilder<PublicScheduleSummary>();
  set schedules(ListBuilder<PublicScheduleSummary>? schedules) =>
      _$this._schedules = schedules;

  PublicClassDetailBuilder() {
    PublicClassDetail._defaults(this);
  }

  PublicClassDetailBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _profile = $v.profile;
      _studios = $v.studios.toBuilder();
      _packages = $v.packages.toBuilder();
      _schedules = $v.schedules.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PublicClassDetail other) {
    _$v = other as _$PublicClassDetail;
  }

  @override
  void update(void Function(PublicClassDetailBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicClassDetail build() => _build();

  _$PublicClassDetail _build() {
    _$PublicClassDetail _$result;
    try {
      _$result =
          _$v ??
          _$PublicClassDetail._(
            profile: BuiltValueNullFieldError.checkNotNull(
              profile,
              r'PublicClassDetail',
              'profile',
            ),
            studios: studios.build(),
            packages: packages.build(),
            schedules: schedules.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'studios';
        studios.build();
        _$failedField = 'packages';
        packages.build();
        _$failedField = 'schedules';
        schedules.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'PublicClassDetail',
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
