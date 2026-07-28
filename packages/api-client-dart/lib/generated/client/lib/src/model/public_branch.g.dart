// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_branch.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

abstract mixin class PublicBranchBuilder {
  void replace(PublicBranch other);
  void update(void Function(PublicBranchBuilder) updates);
  String? get id;
  set id(String? id);

  String? get code;
  set code(String? code);

  String? get name;
  set name(String? name);

  String? get timezone;
  set timezone(String? timezone);

  String? get supportWhatsappE164;
  set supportWhatsappE164(String? supportWhatsappE164);

  PublicBranchProfileBuilder get publicProfile;
  set publicProfile(PublicBranchProfileBuilder? publicProfile);
}

class _$$PublicBranch extends $PublicBranch {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;
  @override
  final String timezone;
  @override
  final String? supportWhatsappE164;
  @override
  final PublicBranchProfile publicProfile;

  factory _$$PublicBranch([void Function($PublicBranchBuilder)? updates]) =>
      ($PublicBranchBuilder()..update(updates))._build();

  _$$PublicBranch._({
    required this.id,
    required this.code,
    required this.name,
    required this.timezone,
    this.supportWhatsappE164,
    required this.publicProfile,
  }) : super._();
  @override
  $PublicBranch rebuild(void Function($PublicBranchBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  $PublicBranchBuilder toBuilder() => $PublicBranchBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is $PublicBranch &&
        id == other.id &&
        code == other.code &&
        name == other.name &&
        timezone == other.timezone &&
        supportWhatsappE164 == other.supportWhatsappE164 &&
        publicProfile == other.publicProfile;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, timezone.hashCode);
    _$hash = $jc(_$hash, supportWhatsappE164.hashCode);
    _$hash = $jc(_$hash, publicProfile.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'$PublicBranch')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name)
          ..add('timezone', timezone)
          ..add('supportWhatsappE164', supportWhatsappE164)
          ..add('publicProfile', publicProfile))
        .toString();
  }
}

class $PublicBranchBuilder
    implements
        Builder<$PublicBranch, $PublicBranchBuilder>,
        PublicBranchBuilder {
  _$$PublicBranch? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(covariant String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(covariant String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(covariant String? name) => _$this._name = name;

  String? _timezone;
  String? get timezone => _$this._timezone;
  set timezone(covariant String? timezone) => _$this._timezone = timezone;

  String? _supportWhatsappE164;
  String? get supportWhatsappE164 => _$this._supportWhatsappE164;
  set supportWhatsappE164(covariant String? supportWhatsappE164) =>
      _$this._supportWhatsappE164 = supportWhatsappE164;

  PublicBranchProfileBuilder? _publicProfile;
  PublicBranchProfileBuilder get publicProfile =>
      _$this._publicProfile ??= PublicBranchProfileBuilder();
  set publicProfile(covariant PublicBranchProfileBuilder? publicProfile) =>
      _$this._publicProfile = publicProfile;

  $PublicBranchBuilder() {
    $PublicBranch._defaults(this);
  }

  $PublicBranchBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _timezone = $v.timezone;
      _supportWhatsappE164 = $v.supportWhatsappE164;
      _publicProfile = $v.publicProfile.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant $PublicBranch other) {
    _$v = other as _$$PublicBranch;
  }

  @override
  void update(void Function($PublicBranchBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  $PublicBranch build() => _build();

  _$$PublicBranch _build() {
    _$$PublicBranch _$result;
    try {
      _$result =
          _$v ??
          _$$PublicBranch._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'$PublicBranch',
              'id',
            ),
            code: BuiltValueNullFieldError.checkNotNull(
              code,
              r'$PublicBranch',
              'code',
            ),
            name: BuiltValueNullFieldError.checkNotNull(
              name,
              r'$PublicBranch',
              'name',
            ),
            timezone: BuiltValueNullFieldError.checkNotNull(
              timezone,
              r'$PublicBranch',
              'timezone',
            ),
            supportWhatsappE164: supportWhatsappE164,
            publicProfile: publicProfile.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'publicProfile';
        publicProfile.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'$PublicBranch',
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
