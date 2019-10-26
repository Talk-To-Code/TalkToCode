package ast;
/**
 * @author GAO RISHENG A0101891L
 * this class is mainly in charge of syntax generation of import statement in C Programs
 */
public final class ASTImportStatementC extends ASTImportStatement{

	public ASTImportStatementC(ASTExpression p) {
		super(p);
		
	}
	public String toSyntax(){
		this.result = "#include <";
		this.result += this.packageName.toSyntax();
		this.result += ">\n";
		return this.result;
	}
}
